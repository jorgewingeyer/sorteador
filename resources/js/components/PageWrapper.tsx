import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Separator } from "./ui/separator";
import { Head } from "@inertiajs/react";

interface Props {
  children: ReactNode;
  title: string | ReactNode;
  description?: string | ReactNode;
  icon?: LucideIcon;
  prefix?: ReactNode;
  action?: ReactNode;
}

const PageWrapper = ({
  children,
  title,
  description,
  icon: Icon,
  prefix,
  action,
}: Props) => {
  return (
    <div className="container mx-auto mb-12 h-full p-8">
      <Head title={title as string} />
      <div className="-mb-4 flex w-full flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 sm:order-1">
            {prefix}
            {Icon && <Icon />}
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          </div>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {action}
      </div>

      <Separator className="my-6" />

      <div className="space-y-6 divide-y divide-border">{children}</div>
    </div>
  );
};

export default PageWrapper;
