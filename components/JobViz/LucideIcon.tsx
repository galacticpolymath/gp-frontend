import * as React from "react";
import * as Lucide from "lucide-react";

export interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, ...svgProps }) => {
  const IconComponent = (Lucide as any)[name] as React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined;
  const Fallback = (Lucide as any)["HelpCircle"] as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  const Icon = IconComponent ?? Fallback;

  return <Icon aria-hidden="true" {...svgProps} />;
};
