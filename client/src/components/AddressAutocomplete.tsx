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
  const { data: suggestions = [], isLoading } = useQuery<AddressSuggestion[]>({
    queryKey: ['/locations/addresses/autocomplete', inputValue, cantonCode],
    queryFn: async () => {
      if (!inputValue || inputValue.trim().length < 2) {
        return [];
      }
      const params = new URLSearchParams({ query: inputValue });
      if (cantonCode) {
        params.append('canton_code', cantonCode);
      }
      return apiRequest<AddressSuggestion[]>('GET', `/locations/addresses/autocomplete?${params.toString()}`);
    },
    enabled: inputValue.trim().length >= 2 && open,
    staleTime: 1000 * 60, // 1 minute
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setOpen(true);
    setSelectedSuggestion(null);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    setSelectedSuggestion(suggestion);
    setInputValue(suggestion.full_address);
    onChange(suggestion.full_address);
    onSelect(suggestion);
    setOpen(false);
  };

  const handleBlur = () => {
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

  // Vérifier si la valeur actuelle correspond à une suggestion valide
  const isValidAddress = selectedSuggestion !== null || 
    (inputValue && suggestions.some(s => s.full_address === inputValue)) ||
    !inputValue || inputValue.trim().length === 0;

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
                error || (!isValidAddress && inputValue.trim().length > 0) 
                  ? "border-destructive" 
                  : ""
              )}
            />
            <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Recherche en cours...</CommandEmpty>
              ) : suggestions.length === 0 ? (
                <CommandEmpty>
                  {inputValue.trim().length < 2 
                    ? "Tapez au moins 2 caractères" 
                    : "Aucune adresse trouvée"}
                </CommandEmpty>
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
      {!isValidAddress && inputValue.trim().length > 0 && (
        <p className="text-sm text-destructive mt-1">
          Veuillez sélectionner une adresse dans la liste
        </p>
      )}
    </div>
  );
}

