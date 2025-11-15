import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Option {
  value: string;
  label: string;
  description?: string;
  available?: boolean;
}

interface ChatOptionsProps {
  options: Option[];
  onSelectOption: (value: string, label: string) => void;
  disabled?: boolean;
}

const ChatOptions = ({ options, onSelectOption, disabled = false }: ChatOptionsProps) => {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {options.map((option, index) => {
        const isSkip = option.value === "skip" || option.label.toLowerCase().includes("skip");
        const isBooked = option.available === false ||
                        option.description?.includes('Booked') ||
                        option.description?.includes('❌');
        const isAvailable = option.available === true ||
                           option.description?.includes('Available') ||
                           option.description?.includes('✅');

        // Construct button text
        let buttonText = option.label;
        if (option.description && !option.description.includes('years exp.')) {
          buttonText = `${option.label} ${option.description}`;
        }

        return (
          <Button
            key={index}
            onClick={() => !isBooked && !disabled && onSelectOption(option.value, option.label)}
            disabled={isBooked || disabled}
            variant="outline"
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-all duration-300 hover:scale-105",
              "border-2 shadow-sm hover:shadow-md",
              // Skip button style
              isSkip && "bg-muted hover:bg-muted/80 text-muted-foreground border-muted-foreground/20",
              // Available slot style (green)
              isAvailable && !isSkip && "border-green-500 bg-green-50 text-green-700 hover:bg-green-500 hover:text-white",
              // Booked slot style (red)
              isBooked && "border-red-500 bg-red-50 text-red-700 cursor-not-allowed opacity-70 hover:scale-100",
              // Default style
              !isSkip && !isAvailable && !isBooked && "border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground"
            )}
          >
            {buttonText}
          </Button>
        );
      })}
    </div>
  );
};

export default ChatOptions;
