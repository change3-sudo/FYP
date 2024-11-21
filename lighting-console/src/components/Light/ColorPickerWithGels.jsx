import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";
import LeeGelColors from './LeeGelColors';

const ColorPickerWithGels = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue.toUpperCase());
    }
  };

  const getMatchingGel = () => {
    const match = Object.entries(LeeGelColors).find(([_, color]) => color.toUpperCase() === value.toUpperCase());
    return match ? match[0] : null;
  };

  // 修改排序邏輯，使用字符串比較而不是數字比較
  const sortedGelEntries = Object.entries(LeeGelColors)
    .sort(([codeA], [codeB]) => {
      // 確保編號都是三位數格式
      const normalizedA = codeA.padStart(3, '0');
      const normalizedB = codeB.padStart(3, '0');
      return normalizedA.localeCompare(normalizedB);
    });

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Color</TabsTrigger>
            <TabsTrigger value="gel">Lee Gels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct" className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="color">Color</Label>
                {getMatchingGel() && (
                  <Badge variant="secondary">Matches Lee Gel L{getMatchingGel()}</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value.toUpperCase())}
                  className="w-20 h-10"
                />
                <Input 
                  type="text"
                  value={inputValue.toUpperCase()}
                  onChange={handleInputChange}
                  placeholder="#FFFFFF"
                  className="flex-1 font-mono"
                  maxLength={7}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="gel" className="w-full space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label>Lee Gel Filter</Label>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {sortedGelEntries.map(([code, color]) => (
                    <Tooltip key={code}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onChange(color.toUpperCase())}
                          className={`
                            relative group p-2 rounded-md transition-all
                            hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${value.toUpperCase() === color.toUpperCase() ? 'ring-2 ring-blue-500' : ''}
                          `}
                          style={{ backgroundColor: color }}
                        >
                          <div
                            className="w-full h-12 rounded-md border flex items-center justify-center font-mono"
                            style={{ 
                              backgroundColor: color,
                              color: getContrastColor(color)
                            }}
                          >
                            L{code.padStart(3, '0')}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Lee Gel #{code.padStart(3, '0')}</p>
                        <p className="text-xs opacity-80">{color.toUpperCase()}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="w-full h-20 rounded-md border relative group overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{backgroundColor: value}}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <span className="bg-white/90 px-2 py-1 rounded-md font-mono text-sm text-black">
              {value.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

// Helper function to determine text color based on background
function getContrastColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default ColorPickerWithGels;