'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ComboboxOption {
  id?: number | string;
  value: string;
  label: string;
  subLabel?: string;
  source?: 'formal' | 'pending'; // 数据来源标记
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string, option?: ComboboxOption) => void;
  onCustomInput?: (value: string) => void; // 回车时触发
  placeholder?: string;
  emptyMessage?: string;
  allowCustomInput?: boolean; // 是否允许自定义输入
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  onCustomInput,
  placeholder = '选择或输入...',
  emptyMessage = '没有找到匹配项。',
  allowCustomInput = true,
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  // 同步外部值
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 处理输入变化
  const handleInputChange = (val: string) => {
    setInputValue(val);
  };

  // 处理回车键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue && onCustomInput) {
        // 检查是否有精确匹配
        const exactMatch = options.find(
          opt => opt.value.toLowerCase() === trimmedValue.toLowerCase()
        );
        if (!exactMatch) {
          onCustomInput(trimmedValue);
        }
      }
      setOpen(false);
    }
  };

  // 处理选择
  const handleSelect = (currentValue: string) => {
    const selected = options.find(opt => opt.value === currentValue);
    if (selected) {
      setInputValue(selected.label);
      onValueChange(selected.value, selected);
    }
    setOpen(false);
  };

  // 获取来源标记颜色
  const getSourceBadge = (source?: 'formal' | 'pending') => {
    if (source === 'pending') {
      return (
        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
          待审批
        </span>
      );
    }
    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {inputValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {emptyMessage}
              {allowCustomInput && inputValue.trim() && (
                <div className="py-2 px-2 text-sm text-muted-foreground">
                  按 Enter 键将 "{inputValue}" 作为自定义输入
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span>{option.label}</span>
                      {getSourceBadge(option.source)}
                    </div>
                    {option.subLabel && (
                      <div className="text-xs text-muted-foreground">
                        {option.subLabel}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
