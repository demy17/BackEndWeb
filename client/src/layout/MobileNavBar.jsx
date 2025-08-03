import React, { useState } from "react";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
Button
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";

import { data } from "../assets/DemoData/SideBarData";
import useUser from "../services/hooks/useUser";
import { Button } from "../components/ui/button";
import { NavMain } from "../components/ui/nav-main";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useUser();

  const handleLogOut = async () => {
    try {
      console.log("Logout clicked");
      await logoutUser();
    } catch (error) {
      console.log(error);
    }
  };

  let nav = data.navMain;
  switch ((currentUser.roles && currentUser?.roles[0]) ?? null) {
    case "Patient":
      nav = data.navMain;
      break;
    case "Doctor":
      nav = data.dotorNavMain;
      break;
    case "Admin":
      nav = data.adminNavMain;
      break;
    default:
      nav = data.navMain;
      break;
  }

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b p-2">
      <div className="flex justify-between items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6" />
                  <div>
                    <p className="font-medium">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <NavMain items={nav} />
              </div>
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleLogOut();
                    setOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-bold">Hospital MS</h1>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile/" + currentUser.refId)}
        >
          <User className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
