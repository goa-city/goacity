import React, { useState } from 'react';
import { useSuperAdmin } from '../hooks/useSuperAdmin';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { 
    PaintBrushIcon, 
    GlobeAltIcon, 
    SparklesIcon,
    CheckCircleIcon
} from '@heroicons/react/24/solid';

const CityBrandingEditor: React.FC = () => {
    const { cities, isLoading, updateBranding, isUpdating } = useSuperAdmin();
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [branding, setBranding] = useState({ primary: '#4f46e5', secondary: '#0ea5e9', accent: '#6366f1' });

    const handleSelectCity = (city: any) => {
        setSelectedCityId(city.id);
        setBranding({
            primary: city.theme_config?.primary || '#4f46e5',
            secondary: city.theme_config?.secondary || '#0ea5e9',
            accent: city.theme_config?.accent || '#6366f1'
        });
    };

    const handleSave = async () => {
        if (selectedCityId) {
            await updateBranding({ id: selectedCityId, branding });
            alert('City branding updated successfully!');
        }
    };

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-400 font-black uppercase text-center tracking-widest">Accessing platform nodes...</div>;

    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                    Multi-City Branding
                    <PaintBrushIcon className="w-8 h-8 text-indigo-600" />
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                    Configure independent brand identities for each city deployment.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* City List */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Select a City</p>
                    {cities.map((city) => (
                        <Card 
                            key={city.id}
                            className={`cursor-pointer transition-all border-zinc-100 dark:border-zinc-800 ${
                                selectedCityId === city.id 
                                ? 'ring-2 ring-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' 
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                            }`}
                            onClick={() => handleSelectCity(city)}
                        >
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                                        <GlobeAltIcon className="w-5 h-5 text-zinc-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-zinc-900 dark:text-white">{city.name}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{city.slug}</p>
                                    </div>
                                </div>
                                {city.theme_config?.primary && (
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: city.theme_config.primary }} />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Editor Panel */}
                <div className="lg:col-span-2">
                    {selectedCityId ? (
                        <Card className="border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-indigo-600/5">
                            <CardContent className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                                        Branding Config
                                        <SparklesIcon className="w-6 h-6 text-indigo-600" />
                                    </h3>
                                    <Button onClick={handleSave} isLoading={isUpdating} className="rounded-xl px-8 shadow-xl shadow-indigo-600/20">
                                        Apply Branding
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Primary Color */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block ml-1">Primary Color</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="color" 
                                                value={branding.primary}
                                                onChange={(e) => setBranding({ ...branding, primary: e.target.value })}
                                                className="w-16 h-16 rounded-xl cursor-pointer border-4 border-white dark:border-zinc-800 shadow-xl"
                                            />
                                            <Input 
                                                value={branding.primary} 
                                                onChange={(e) => setBranding({ ...branding, primary: e.target.value })}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                                            Used for main buttons, headers, and primary UI highlights.
                                        </p>
                                    </div>

                                    {/* Secondary Color */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block ml-1">Secondary Color</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="color" 
                                                value={branding.secondary}
                                                onChange={(e) => setBranding({ ...branding, secondary: e.target.value })}
                                                className="w-16 h-16 rounded-xl cursor-pointer border-4 border-white dark:border-zinc-800 shadow-xl"
                                            />
                                            <Input 
                                                value={branding.secondary} 
                                                onChange={(e) => setBranding({ ...branding, secondary: e.target.value })}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                                            Used for auxiliary indicators and secondary action buttons.
                                        </p>
                                    </div>

                                    {/* Accent Color */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block ml-1">Accent Color</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="color" 
                                                value={branding.accent}
                                                onChange={(e) => setBranding({ ...branding, accent: e.target.value })}
                                                className="w-16 h-16 rounded-xl cursor-pointer border-4 border-white dark:border-zinc-800 shadow-xl"
                                            />
                                            <Input 
                                                value={branding.accent} 
                                                onChange={(e) => setBranding({ ...branding, accent: e.target.value })}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                                            Used for special highlights, active states, and decorative elements.
                                        </p>
                                    </div>
                                </div>

                                {/* Preview Card */}
                                <div className="mt-12 p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 text-center">Live Component Preview</p>
                                    <div className="flex flex-wrap items-center justify-center gap-6">
                                        <button 
                                            className="px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg"
                                            style={{ backgroundColor: branding.primary }}
                                        >
                                            Primary Button
                                        </button>
                                        <div 
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                                            style={{ backgroundColor: branding.accent }}
                                        >
                                            <CheckCircleIcon className="w-6 h-6" />
                                        </div>
                                        <span 
                                            className="text-sm font-black"
                                            style={{ color: branding.secondary }}
                                        >
                                            Secondary Link
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-20 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                            <GlobeAltIcon className="w-16 h-16 text-zinc-100 dark:text-zinc-900 mb-6" />
                            <h3 className="text-xl font-black text-zinc-400 uppercase tracking-widest">No City Selected</h3>
                            <p className="text-zinc-500 mt-2 max-w-xs">Select a city deployment from the left panel to begin customizing its brand identity.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CityBrandingEditor;
