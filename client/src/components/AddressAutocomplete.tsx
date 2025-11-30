import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressSuggestion {
  address: string;
  city_name: string;
  postal_code: string;
  canton_code: string;
  canton_name: string;
  full_address: string;
  source: 'existing_property' | 'suggestion';
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  cantonCode?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  'data-testid'?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  cantonCode,
  placeholder = "Entrez une adresse...",
  disabled = false,
  className,
  error = false,
  'data-testid': dataTestId,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [debouncedInputValue, setDebouncedInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);

  // Mettre à jour inputValue quand value change de l'extérieur
  useEffect(() => {
    setInputValue(value);
    setDebouncedInputValue(value);
  }, [value]);

  // Debounce pour limiter les requêtes à Nominatim
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, 500); // 500ms de délai pour réduire les requêtes

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Requête d'autocomplétion via Nominatim (OpenStreetMap)
  const { data: suggestions = [], isLoading, error: queryError } = useQuery<AddressSuggestion[]>({
    queryKey: ['nominatim-address-autocomplete', debouncedInputValue, cantonCode],
    queryFn: async () => {
      if (!debouncedInputValue || debouncedInputValue.trim().length < 2) {
        return [];
      }

      try {
        // Construire la requête pour Nominatim avec des paramètres optimisés
        const query = debouncedInputValue.trim();
        
        // Si la requête semble être une adresse (contient des chiffres ou mots-clés d'adresse)
        const isAddressQuery = /\d/.test(query) || /\b(rue|strasse|str|via|chemin|route|avenue|av|platz|place)\b/i.test(query);
        
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '8', // Réduire à 8 pour des résultats plus rapides
          countrycodes: 'ch', // Limiter à la Suisse
          'accept-language': 'fr',
          namedetails: '0', // Pas besoin des noms alternatifs
          extratags: '0', // Pas besoin de tags supplémentaires
        });

        // Ajouter le canton si spécifié (codes cantonaux suisses)
        const cantonMap: Record<string, string> = {
          'ZH': 'Zürich', 'BE': 'Bern', 'LU': 'Luzern', 'UR': 'Uri',
          'SZ': 'Schwyz', 'OW': 'Obwalden', 'NW': 'Nidwalden', 'GL': 'Glarus',
          'ZG': 'Zug', 'FR': 'Fribourg', 'SO': 'Solothurn', 'BS': 'Basel',
          'BL': 'Basel-Landschaft', 'SH': 'Schaffhausen', 'AR': 'Appenzell Ausserrhoden',
          'AI': 'Appenzell Innerrhoden', 'SG': 'St. Gallen', 'GR': 'Graubünden',
          'AG': 'Aargau', 'TG': 'Thurgau', 'TI': 'Ticino', 'VD': 'Vaud',
          'VS': 'Valais', 'NE': 'Neuchâtel', 'GE': 'Genève', 'JU': 'Jura'
        };

        if (cantonCode && cantonMap[cantonCode]) {
          // Ajouter le canton dans la requête pour plus de précision
          params.set('q', `${query}, ${cantonMap[cantonCode]}, Switzerland`);
        }

        // Faire la requête à Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: {
              'User-Agent': 'Hoomy-Property-App/1.0', // Requis par Nominatim
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erreur lors de la recherche d\'adresses');
        }

        const data = await response.json();

        // Mapper les résultats de Nominatim vers notre format
        // Prioriser les résultats avec numéros de maison et codes postaux
        const mappedSuggestions: AddressSuggestion[] = data
          .filter((item: any) => {
            // Filtrer pour ne garder que les résultats pertinents
            if (!item.address || !item.display_name) return false;
            const addr = item.address;
            // Prioriser les adresses avec route/street ET (numéro de maison OU code postal)
            return (addr.road || addr.street) && (addr.house_number || addr.postcode);
          })
          .map((item: any) => {
            const address = item.address;
            const road = address.road || address.street || '';
            const houseNumber = address.house_number || '';
            const streetAddress = houseNumber ? `${road} ${houseNumber}`.trim() : road;
            
            // Extraire le code postal
            const postalCode = address.postcode || '';
            
            // Extraire la ville (prioriser city, puis town, puis village)
            const city = address.city || address.town || address.village || address.municipality || '';
            
            // Extraire le canton (state en Suisse)
            const cantonName = address.state || '';
            
            // Mapper le nom du canton vers le code
            const cantonCodeMap: Record<string, string> = {
              'Zürich': 'ZH', 'Bern': 'BE', 'Luzern': 'LU', 'Uri': 'UR',
              'Schwyz': 'SZ', 'Obwalden': 'OW', 'Nidwalden': 'NW', 'Glarus': 'GL',
              'Zug': 'ZG', 'Fribourg': 'FR', 'Solothurn': 'SO', 'Basel-Stadt': 'BS',
              'Basel-Landschaft': 'BL', 'Schaffhausen': 'SH', 'Appenzell Ausserrhoden': 'AR',
              'Appenzell Innerrhoden': 'AI', 'St. Gallen': 'SG', 'Graubünden': 'GR',
              'Aargau': 'AG', 'Thurgau': 'TG', 'Ticino': 'TI', 'Vaud': 'VD',
              'Valais': 'VS', 'Neuchâtel': 'NE', 'Genève': 'GE', 'Jura': 'JU',
              'Basel': 'BS', 'Lausanne': 'VD', 'Genf': 'GE'
            };
            
            const code = Object.entries(cantonCodeMap).find(([name]) => 
              cantonName.toLowerCase().includes(name.toLowerCase()) || 
              name.toLowerCase().includes(cantonName.toLowerCase())
            )?.[1] || '';

            // Construire l'adresse complète de manière cohérente
            const fullAddress = streetAddress 
              ? `${streetAddress}${postalCode && city ? `, ${postalCode} ${city}` : city ? `, ${city}` : postalCode ? `, ${postalCode}` : ''}`.trim()
              : item.display_name;

            return {
              address: streetAddress || item.display_name.split(',')[0].trim(),
              city_name: city || item.display_name.split(',')[0].trim(),
              postal_code: postalCode,
              canton_code: code,
              canton_name: cantonName,
              full_address: fullAddress,
              source: 'suggestion' as const,
            };
          })
          // Trier pour prioriser les résultats avec numéro de maison et code postal
          .sort((a: AddressSuggestion, b: AddressSuggestion) => {
            const aHasNumber = /\d/.test(a.address);
            const bHasNumber = /\d/.test(b.address);
            const aHasPostal = !!a.postal_code;
            const bHasPostal = !!b.postal_code;
            
            // Prioriser : numéro de maison + code postal > numéro de maison > code postal > autre
            if (aHasNumber && aHasPostal && !(bHasNumber && bHasPostal)) return -1;
            if (bHasNumber && bHasPostal && !(aHasNumber && aHasPostal)) return 1;
            if (aHasNumber && !bHasNumber) return -1;
            if (bHasNumber && !aHasNumber) return 1;
            if (aHasPostal && !bHasPostal) return -1;
            if (bHasPostal && !aHasPostal) return 1;
            return 0;
          })
          .filter((suggestion: AddressSuggestion) => suggestion.address && suggestion.postal_code);

        return mappedSuggestions;
      } catch (error) {
        console.warn('Erreur autocomplétion adresse:', error);
        return [];
      }
    },
    enabled: debouncedInputValue.trim().length >= 3, // Augmenter à 3 caractères minimum
    staleTime: 1000 * 60 * 10, // 10 minutes (augmenter le cache)
    retry: 1, // Réessayer une fois en cas d'erreur
    gcTime: 1000 * 60 * 15, // Garder en cache 15 minutes
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setSelectedSuggestion(null);
    // Ouvrir le popover si l'utilisateur a tapé au moins 3 caractères
    if (newValue.trim().length >= 3) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    setSelectedSuggestion(suggestion);
    setInputValue(suggestion.full_address);
    onChange(suggestion.full_address);
    onSelect(suggestion);
    setOpen(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Ne pas fermer si le focus passe vers le popover
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && (relatedTarget.closest('[role="dialog"]') || relatedTarget.closest('[role="listbox"]'))) {
      return;
    }
    // Attendre un peu avant de fermer pour permettre le clic sur une suggestion
    setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  const handleFocus = () => {
    if (inputValue.trim().length >= 3) {
      setOpen(true);
    }
  };

  // Permettre la saisie manuelle si aucune suggestion valide n'est disponible
  // L'adresse sera considérée comme valide si elle est saisie manuellement
  const isValidAddress = selectedSuggestion !== null || 
    (inputValue && Array.isArray(suggestions) && suggestions.some(s => s && s.full_address === inputValue)) ||
    !inputValue || inputValue.trim().length === 0 ||
    (inputValue.trim().length > 0 && Array.isArray(suggestions) && suggestions.length === 0 && !queryError && !isLoading);

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              data-testid={dataTestId}
              className={cn(
                "pr-8",
                error || (!isValidAddress && inputValue.trim().length > 0) 
                  ? "border-destructive" 
                  : ""
              )}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (inputValue.trim().length >= 3) {
                  setOpen(!open);
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground focus:outline-none"
              tabIndex={-1}
            >
              <ChevronsUpDown className="h-4 w-4" />
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[400px] overflow-hidden" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Recherche en cours...
                </div>
              ) : queryError ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Service d'autocomplétion non disponible
                </div>
              ) : suggestions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {inputValue.trim().length < 2 
                    ? "Tapez au moins 3 caractères" 
                    : "Aucune adresse trouvée"}
                </div>
              ) : (
                <CommandGroup>
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={`${suggestion.full_address}-${index}`}
                      value={suggestion.full_address}
                      onSelect={() => handleSelect(suggestion)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSuggestion?.full_address === suggestion.full_address
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{suggestion.full_address}</span>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.postal_code} {suggestion.city_name} • {suggestion.canton_name}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {!isValidAddress && inputValue.trim().length > 0 && suggestions.length > 0 && (
        <p className="text-sm text-destructive mt-1">
          Veuillez sélectionner une adresse dans la liste ou continuer à saisir manuellement
        </p>
      )}
    </div>
  );
}

