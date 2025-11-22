import React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import { cn } from '@/lib/utils';

export const TopNavMenu: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <NavigationMenu>
        <NavigationMenuList>
          {/* News */}
          <NavigationMenuItem>
            <NavigationMenuLink
              href="https://vestig.oragenai.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none"
              )}
            >
              News
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Radio */}
          <NavigationMenuItem>
            <NavigationMenuLink
              href="https://www.scuffedepoch.com/radio.html"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none"
              )}
            >
              Radio
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Gallery */}
          <NavigationMenuItem>
            <NavigationMenuLink
              href="https://gallery.scuffedepoch.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none"
              )}
            >
              Gallery
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* MORE Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10">
              MORE
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-48 p-2 bg-card border border-primary/20 rounded-md shadow-lg">
                <div className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wide">
                  MORE
                </div>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="https://careless.oragenai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      Careless
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://cognition.oragenai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      Cognition
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://spittoon.oragenai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      Spittoon
                    </a>
                  </li>
                  <li className="pt-1 border-t border-primary/10">
                    <a
                      href="https://www.oragenai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-2 text-sm font-semibold rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      ALL APPS
                    </a>
                  </li>
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Ko-fi Button */}
      <a
        href="https://ko-fi.com/driftjohnson"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block hover:opacity-80 transition-opacity"
      >
        <img
          src="https://cdn.ko-fi.com/cdn/kofi3.png?v=3"
          alt="Buy Me a Coffee at ko-fi.com"
          className="h-8"
        />
      </a>
    </div>
  );
};
