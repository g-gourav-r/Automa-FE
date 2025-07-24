import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

// Make sure React is imported for React.ReactNode

interface AuthLayoutProps {
  children: React.ReactNode;
  title: React.ReactNode; // Changed to React.ReactNode to accept JSX
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-[380px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            {title} {/* This will now correctly render your logo and text */}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
