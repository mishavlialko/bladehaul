'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { inputClass } from '@/components/sections/QuoteField';
import { cn } from '@/lib/cn';
import { VEHICLE_MAKES } from '@/lib/makes';
import type { QuoteInput } from '@/lib/validation';

type VehicleMakeComboboxProps = {
  id: string;
  hasError: boolean;
};

function filterMakes(value: string): readonly string[] {
  const query = value.trim().toLocaleLowerCase();
  if (!query) return VEHICLE_MAKES;

  return VEHICLE_MAKES.filter((make) =>
    make.toLocaleLowerCase().includes(query),
  );
}

function initialActiveIndex(value: string, options: readonly string[]): number {
  if (options.length === 0) return -1;

  const selectedIndex = options.findIndex(
    (make) => make.toLocaleLowerCase() === value.trim().toLocaleLowerCase(),
  );
  return selectedIndex >= 0 ? selectedIndex : 0;
}

export default function VehicleMakeCombobox({
  id,
  hasError,
}: VehicleMakeComboboxProps) {
  const { control } = useFormContext<QuoteInput>();
  const {
    field: { name, onBlur, onChange, ref: fieldRef, value: fieldValue },
  } = useController({
    control,
    name: 'vehicleMake',
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [filterQuery, setFilterQuery] = useState<string | null>(null);

  const value = fieldValue ?? '';
  const filteredMakes = useMemo(
    () => filterMakes(filterQuery ?? ''),
    [filterQuery],
  );
  const activeOptionId =
    isOpen && activeIndex >= 0 && filteredMakes[activeIndex]
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsidePointer(event: globalThis.PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
        setFilterQuery(null);
      }
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  }, [activeIndex, isOpen]);

  function openMenu(fallbackIndex = 0) {
    setIsOpen(true);
    setFilterQuery(null);
    const selectedIndex = initialActiveIndex(value, VEHICLE_MAKES);
    const hasExactSelection =
      VEHICLE_MAKES[selectedIndex]?.toLocaleLowerCase() ===
      value.trim().toLocaleLowerCase();
    setActiveIndex(hasExactSelection ? selectedIndex : fallbackIndex);
  }

  function selectMake(make: string) {
    onChange(make);
    setIsOpen(false);
    setActiveIndex(-1);
    setFilterQuery(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      if (!isOpen) {
        openMenu(event.key === 'ArrowDown' ? 0 : VEHICLE_MAKES.length - 1);
        return;
      }

      if (filteredMakes.length === 0) return;
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => {
        const next = current < 0 ? 0 : current + offset;
        return (next + filteredMakes.length) % filteredMakes.length;
      });
      return;
    }

    if (event.key === 'Enter' && isOpen) {
      event.preventDefault();
      const activeMake = filteredMakes[activeIndex];
      if (activeMake) selectMake(activeMake);
      else {
        setIsOpen(false);
        setFilterQuery(null);
      }
      return;
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      setFilterQuery(null);
      return;
    }

    if (event.key === 'Tab') {
      setIsOpen(false);
      setActiveIndex(-1);
      setFilterQuery(null);
    }
  }

  function handleOptionPointerDown(
    event: PointerEvent<HTMLButtonElement>,
    make: string,
  ) {
    if (event.button !== 0) return;
    event.preventDefault();
    selectMake(make);
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          id={id}
          ref={fieldRef}
          name={name}
          type="text"
          role="combobox"
          autoComplete="off"
          placeholder="Toyota"
          value={value}
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-expanded={isOpen}
          aria-activedescendant={activeOptionId}
          aria-invalid={hasError}
          onChange={(event) => {
            const nextValue = event.target.value;
            const nextOptions = filterMakes(nextValue);
            onChange(nextValue);
            setIsOpen(true);
            setFilterQuery(nextValue);
            setActiveIndex(initialActiveIndex(nextValue, nextOptions));
          }}
          onBlur={onBlur}
          onFocus={() => openMenu()}
          onClick={() => {
            if (!isOpen) openMenu();
          }}
          onKeyDown={handleKeyDown}
          className={cn(inputClass(hasError), 'pr-12')}
        />
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.75}
          className={cn(
            'pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-dim transition-transform duration-150 motion-reduce:transition-none',
            isOpen && 'rotate-180',
          )}
        />
      </div>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Vehicle make suggestions"
          className="vehicle-make-options absolute inset-x-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-xl bg-paper p-1 shadow-lg shadow-navy/10 ring-1 ring-line"
        >
          {filteredMakes.length > 0 ? (
            filteredMakes.map((make, index) => {
              const isActive = index === activeIndex;
              const isSelected =
                make.toLocaleLowerCase() === value.trim().toLocaleLowerCase();

              return (
                <button
                  key={make}
                  id={`${listboxId}-option-${index}`}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  onMouseMove={() => setActiveIndex(index)}
                  onPointerDown={(event) =>
                    handleOptionPointerDown(event, make)
                  }
                  onClick={() => selectMake(make)}
                  className={cn(
                    'flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-navy text-white'
                      : 'text-text hover:bg-line-soft',
                  )}
                >
                  <span className="truncate">{make}</span>
                  {isSelected && (
                    <Check
                      aria-hidden="true"
                      strokeWidth={2.25}
                      className="h-4 w-4 shrink-0 text-orange"
                    />
                  )}
                </button>
              );
            })
          ) : (
            <div
              role="option"
              aria-disabled="true"
              aria-selected="false"
              className="flex min-h-11 items-center px-3 py-2 text-sm text-text-dim"
            >
              No matches. Keep your typed make.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
