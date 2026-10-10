import React from 'react';
import { 
  Sun, 
  Moon, 
  CloudSun, 
  CloudMoon, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudSnow, 
  Snowflake, 
  CloudLightning, 
  CloudFog, 
  CloudHail, 
  Wind,
  SunDim
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = 'w-6 h-6', size }) => {
  const iconProps = { className, size };

  switch (name) {
    case 'Sun':
      return <Sun {...iconProps} className={`${className} text-amber-400`} />;
    case 'SunDim':
      return <SunDim {...iconProps} className={`${className} text-amber-300`} />;
    case 'Moon':
      return <Moon {...iconProps} className={`${className} text-indigo-300`} />;
    case 'CloudSun':
      return <CloudSun {...iconProps} className={`${className} text-amber-400`} />;
    case 'CloudMoon':
      return <CloudMoon {...iconProps} className={`${className} text-blue-300`} />;
    case 'Cloud':
      return <Cloud {...iconProps} className={`${className} text-slate-300`} />;
    case 'CloudRain':
      return <CloudRain {...iconProps} className={`${className} text-cyan-400`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle {...iconProps} className={`${className} text-teal-300`} />;
    case 'CloudSnow':
      return <CloudSnow {...iconProps} className={`${className} text-sky-200`} />;
    case 'Snowflake':
      return <Snowflake {...iconProps} className={`${className} text-sky-100`} />;
    case 'CloudLightning':
      return <CloudLightning {...iconProps} className={`${className} text-yellow-300 animate-pulse`} />;
    case 'CloudFog':
      return <CloudFog {...iconProps} className={`${className} text-slate-400`} />;
    case 'CloudHail':
      return <CloudHail {...iconProps} className={`${className} text-cyan-300`} />;
    default:
      return <Wind {...iconProps} className={`${className} text-slate-300`} />;
  }
};
