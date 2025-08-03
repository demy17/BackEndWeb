import {
    AudioWaveform,
    CalendarCheck,
    Command,
    GalleryVerticalEnd,
    Pill,
    Settings2,
    User,
  } from "lucide-react"

export const data = {
  user: {},
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Appointments",
      url: "#",
      icon: CalendarCheck,
      isActive: true,
      items: [
        {
          title: "Manage Appointments",
          url: "/appointments",
        },
        // {
        //   title: "Shecdule Appointment",
        //   url: "/appointments/new",
        // },
      ],
    },
    {
      title: "Prescriptions",
      url: "#",
      icon: Pill,
      items: [
        {
          title: "View My Prescriptions",
          url: "/prescriptions",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
      ],
    },
  ],
  dotorNavMain: [
    {
      title: "Appointments",
      url: "#",
      icon: CalendarCheck,
      isActive: true,
      items: [
        {
          title: "View Appointments",
          url: "/doctor/appointments",
        },
        // {
        //   title: "Shecdule Appointment",
        //   url: "/appointments/new",
        // },
      ],
    },
    {
      title: "Prescription",
      url: "#",
      icon: Pill,
      items: [
        // {
        //   title: "Issue a Prescription",
        //   url: "/doctor/prescriptions/add",
        // },
        {
          title: "Manage Prescriptions",
          url: "/doctor/prescriptions",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
      ],
    },
  ],
  adminNavMain: [
    {
      title: "Users",
      url: "#",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Manage Users",
          url: "/admin/users",
        },
      ],
    },
    {
      title: "Doctors",
      url: "#",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Manage Doctors",
          url: "/admin/doctors",
        },
      ],
    },
    {
      title: "Appointments",
      url: "#",
      icon: CalendarCheck,
      items: [
        {
          title: "View All Appointments",
          url: "/admin/appointments",
        },
      ],
    },
    {
      title: "Prescriptions",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Manage Prescriptions",
          url: "/admin/prescriptions",
        },
      ],
    },
  ],
};