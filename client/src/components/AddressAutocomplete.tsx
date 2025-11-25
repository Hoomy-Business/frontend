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
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);

  // Mettre à jour inputValue quand value change de l'extérieur
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Requête d'autocomplétion
  const { data: suggestions = [], isLoading, error: queryError } = useQuery<AddressSuggestion[]>({
    queryKey: ['/locations/addresses/autocomplete', inputValue, cantonCode],
    queryFn: async () => {
      if (!inputValue || inputValue.trim().length < 2) {
        return [];
      }
      const params = new URLSearchParams({ query: inputValue });
      if (cantonCode) {
        params.append('canton_code', cantonCode);
      }
      try {
        return await apiRequest<AddressSuggestion[]>('GET', `/locations/addresses/autocomplete?${params.toString()}`);
      } catch (error) {
        // Si l'endpoint n'existe pas ou retourne une erreur, retourner un tableau vide
        console.warn('Erreur autocomplétion adresse:', error);
        return [];
      }
    },
    enabled: inputValue.trim().length >= 2,
    staleTime: 1000 * 60, // 1 minute
    retry: false, // Ne pas réessayer en cas d'erreur
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

