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
    }, 300); // 300ms de délai

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
        // Construire la requête pour Nominatim
        const query = debouncedInputValue.trim();
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '10',
          countrycodes: 'ch', // Limiter à la Suisse
          'accept-language': 'fr',
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
          params.append('state', cantonMap[cantonCode]);
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
        const mappedSuggestions: AddressSuggestion[] = data
          .filter((item: any) => item.address && item.display_name)
          .map((item: any) => {
            const address = item.address;
            const road = address.road || address.street || '';
            const houseNumber = address.house_number || '';
            const streetAddress = houseNumber ? `${road} ${houseNumber}`.trim() : road;
            
            // Extraire le code postal
            const postalCode = address.postcode || '';
            
            // Extraire la ville
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
              'Valais': 'VS', 'Neuchâtel': 'NE', 'Genève': 'GE', 'Jura': 'JU'
            };
            
            const code = Object.entries(cantonCodeMap).find(([name]) => 
              cantonName.toLowerCase().includes(name.toLowerCase())
            )?.[1] || '';

            // Construire l'adresse complète
            const fullAddress = streetAddress 
              ? `${streetAddress}${city ? `, ${city}` : ''}${postalCode ? ` ${postalCode}` : ''}`.trim()
              : item.display_name;

            return {
              address: streetAddress || item.display_name.split(',')[0],
              city_name: city || item.display_name.split(',')[0],
              postal_code: postalCode,
              canton_code: code,
              canton_name: cantonName,
              full_address: fullAddress,
              source: 'suggestion' as const,
            };
          })
          .filter((suggestion: AddressSuggestion) => suggestion.address && suggestion.postal_code);

        return mappedSuggestions;
      } catch (error) {
        console.warn('Erreur autocomplétion adresse:', error);
        return [];
      }
    },
    enabled: debouncedInputValue.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes (Nominatim a des limites de taux)
    retry: 1, // Réessayer une fois en cas d'erreur
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setSelectedSuggestion(null);
    // Ouvrir le popover si l'utilisateur a tapé au moins 2 caractères
    if (newValue.trim().length >= 2) {
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
    if (inputValue.trim().length >= 2) {
      setOpen(true);
    }
  };

  // Permettre la saisie manuelle si aucune suggestion valide n'est disponible
  // L'adresse sera considérée comme valide si elle est saisie manuellement
  const isValidAddress = selectedSuggestion !== null || 
    (inputValue && suggestions.some(s => s.full_address === inputValue)) ||
    !inputValue || inputValue.trim().length === 0 ||
    (inputValue.trim().length > 0 && suggestions.length === 0 && !queryError && !isLoading);

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
                if (inputValue.trim().length >= 2) {
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
                    ? "Tapez au moins 2 caractères" 
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

