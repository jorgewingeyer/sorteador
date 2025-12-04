import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  children: React.ReactNode;
  size?: "default" | "small" | "large" | "xl" | "full";
  icon?: ReactNode;
}

const sizes = {
  small: {
    grid: "md:grid-cols-3",
    content: "md:col-span-1",
    slot: "md:col-span-2",
  },
  default: {
    grid: "md:grid-cols-2",
    content: "md:col-span-1",
    slot: "md:col-span-1",
  },
  large: {
    grid: "md:grid-cols-3",
    content: "md:col-span-1",
    slot: "md:col-span-2",
  },
  xl: {
    grid: "md:grid-cols-4",
    content: "md:col-span-1",
    slot: "md:col-span-3",
  },
  full: {
    grid: "md:grid-cols-5",
    content: "md:col-span-1",
    slot: "md:col-span-4",
  },
};

const PageSection = ({
  children,
  title,
  description,
  size = "default",
  icon,
}: Props) => {
  return (
    <div className={`grid grid-cols-1 ${sizes[size].grid} gap-6`}>
      <div className={sizes[size].content}>
        <h2 className="flex items-center text-xl font-medium sm:text-2xl">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={sizes[size].slot}>
        <Card className="py-2 mb-6">
          <CardContent className="py-4">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageSection;
