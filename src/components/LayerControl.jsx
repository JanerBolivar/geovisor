import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

const LayerControl = ({
    name,
    type = 'polygon',
    isActive = false,
    onToggle,
    color = '#3b82f6',
    opacity = 0.7,
    onOpacityChange,
    showControls = true
}) => {
    return (
        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full border"
                    style={{
                        backgroundColor: type === 'point' ? color : 'transparent',
                        borderColor: color,
                        borderWidth: type === 'polygon' ? '2px' : '1px'
                    }}
                />
                <span className="text-sm text-gray-800">{name}</span>
            </div>

            <div className="flex items-center gap-1">
                {showControls && (
                    <>
                        {/* Botón de información */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-600 hover:text-gray-900"
                        >
                            <Info className="h-3 w-3" />
                        </Button>

                        {/* Control de opacidad */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-600 hover:text-gray-900"
                                >
                                    <Settings className="h-3 w-3" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Opacidad</h4>
                                    <Slider
                                        defaultValue={[opacity * 100]}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) => onOpacityChange && onOpacityChange(value[0] / 100)}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>0%</span>
                                        <span>50%</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </>
                )}

                {/* Switch de activación */}
                <Switch
                    checked={isActive}
                    onCheckedChange={onToggle}
                    className="h-4 w-8"
                />
            </div>
        </div>
    );
};

export default LayerControl;