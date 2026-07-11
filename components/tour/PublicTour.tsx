"use client";

import { useEffect } from "react";
import { createTour, shouldAutoStart } from "./tour";
import TourButton from "./TourButton";

function start() {
  const tour = createTour([
    {
      popover: {
        title: "Welcome to DigSite Leads",
        description:
          "A digital property that turns excavation demand into qualified leads. This quick tour walks the public site, then the admin pipeline where leads land.",
      },
    },
    {
      element: "#hero-pitch",
      popover: {
        title: "The pitch",
        description:
          "Homeowners and contractors arrive here — foundations, pools, trenching, grading, demolition. The page sells one action: describe your dig, get matched.",
        side: "bottom",
      },
    },
    {
      element: "#tour-contact",
      popover: {
        title: "Contact info",
        description:
          "Every lead arrives ready to work: name, phone, and email — no chasing missing contact details.",
        side: "right",
      },
    },
    {
      element: "#tour-project",
      popover: {
        title: "Qualification built in",
        description:
          "Project type, scope, timeline, and budget mirror how excavators qualify work — so you can size up the job before anyone picks up the phone.",
        side: "right",
      },
    },
    {
      element: "#tour-location",
      popover: {
        title: "Pin-drop location",
        description:
          "The signature feature: click the map to drop a pin on the exact dig site. The address auto-fills from the pin — every lead comes in with the dig site already marked.",
        side: "left",
      },
    },
    {
      element: "#tour-submit",
      popover: {
        title: "No pin, no lead",
        description:
          "Submit stays disabled until a pin is dropped, so location data is guaranteed on every submission.",
        side: "top",
      },
    },
    {
      element: "#how-it-works",
      popover: {
        title: "The homeowner's view",
        description:
          "Three steps: pin the site, describe the dig, get matched with a vetted local pro.",
        side: "top",
      },
    },
    {
      popover: {
        title: "Now, where do leads go?",
        description:
          "Every submission lands in the admin pipeline, ready to work. Let's look. (If a sign-in screen appears, enter the demo password — the tour picks right back up.)",
        nextBtnText: "Tour the Admin →",
        onNextClick: () => {
          window.location.assign("/admin?tour=1");
        },
      },
    },
  ]);
  tour.drive();
}

export default function PublicTour() {
  useEffect(() => {
    if (shouldAutoStart()) {
      const t = setTimeout(start, 600);
      return () => clearTimeout(t);
    }
  }, []);

  return <TourButton onClick={start} />;
}
