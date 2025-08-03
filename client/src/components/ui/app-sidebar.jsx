import * as React from "react"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./sidebar"
import { data } from "../..//assets/DemoData/SideBarData"
import useUser from "../../services/hooks/useUser"


export function AppSidebar({
  ...props
}) {

  const { user, teams } = data;
  let {currentUser} = useUser();
  let Auser = {
    name: currentUser.firstName + " " + currentUser.lastName,
    avatar: currentUser.avatar,
    email: currentUser.email,
    refId: currentUser.refId,
  }
  // console.log(Auser);
  let nav = data.navMain;
  switch ( (currentUser.roles && currentUser?.roles[0]) ?? null) {
    case 'Patient':
      nav = data.navMain;
      break;
    case 'Doctor':
      nav = data.dotorNavMain;
      break;
    case 'Admin':
      nav = data.adminNavMain;
      break;
  
    default:
      nav = data.navMain;
      break;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={nav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={ Auser || user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
