import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { City } from '@shared/schema';
import { useLanguage } from '@/lib/useLanguage';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (city: City) => void;
  cantonCode?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function CityAutocomplete({
  value,
  onChange,
  onSelect,
  cantonCode,
  placeholder = "Rechercher une ville...",
  disabled = false,
  className,
  error = false,
}: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const { getCityName } = useLanguage();

  // Mettre à jour inputValue quand value change de l'extérieur
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Requête d'autocomplétion
  const { data: suggestions = [], isLoading } = useQuery<City[]>({
    queryKey: ['/locations/cities/autocomplete', inputValue, cantonCode],
    queryFn: async () => {
      if (!inputValue || inputValue.trim().length < 1) {
        return [];
      }
      const params = new URLSearchParams({ query: inputValue });
      if (cantonCode) {
        params.append('canton_code', cantonCode);
      }
      return apiRequest<City[]>('GET', `/locations/cities/autocomplete?${params.toString()}`);
    },
    enabled: inputValue.trim().length >= 1 && open,
    staleTime: 1000 * 60, // 1 minute
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setOpen(true);
    setSelectedCity(null);
  };

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    setInputValue(getCityName(city.name));
    onChange(city.name);
    onSelect(city);
    setOpen(false);
  };

  const handleBlur = () => {
    // Attendre un peu avant de fermer pour permettre le clic sur une suggestion
    setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  const handleFocus = () => {
    if (inputValue.trim().length >= 1) {
      setOpen(true);
    }
  };

  // Vérifier si la valeur actuelle correspond à une suggestion valide
  const isValidCity = selectedCity !== null || 
    (inputValue && Array.isArray(suggestions) && suggestions.some(s => s && s.name && (getCityName(s.name) === inputValue || s.name === inputValue))) ||
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
              className={cn(
                error || (!isValidCity && inputValue.trim().length > 0) 
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
                  {inputValue.trim().length < 1 
                    ? "Tapez au moins 1 caractère" 
                    : "Aucune ville trouvée"}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={city.name}
                      onSelect={() => handleSelect(city)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCity?.id === city.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{getCityName(city.name)}</span>
                        <span className="text-xs text-muted-foreground">
                          {city.postal_code} • {city.canton_name || city.canton_code}
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
      {!isValidCity && inputValue.trim().length > 0 && (
        <p className="text-sm text-destructive mt-1">
          Veuillez sélectionner une ville dans la liste
        </p>
      )}
    </div>
  );
}

