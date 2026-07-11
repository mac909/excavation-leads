"use client";

import { useEffect } from "react";
import { createTour, shouldAutoStart } from "./tour";

function start() {
  const tour = createTour([
    {
      element: "#tour-lead-info",
      popover: {
        title: "The full submission",
        description:
          "Contact, location, project type, timeline, budget, and the homeowner's own description — everything captured on the public form.",
        side: "right",
      },
    },
    {
      element: "#tour-detail-map",
      popover: {
        title: "The exact site",
        description:
          "The pin the submitter dropped. Crews can scout access, terrain, and neighboring parcels before ever calling back.",
        side: "left",
      },
    },
    {
      element: "#tour-triage",
      popover: {
        title: "Close the loop",
        description:
          "New → Contacted → Qualified (or Rejected). Change the status here and it updates everywhere — table, stat cards, and map colors.",
        side: "top",
      },
    },
    {
      popover: {
        title: "That's the whole loop",
        description:
          "Captured on the public site → contacted → quoted → booked job. Tour complete — explore freely from here.",
        doneBtnText: "Finish",
      },
    },
  ]);
  tour.drive();
}

export default function DetailTour() {
  useEffect(() => {
    if (shouldAutoStart()) {
      const t = setTimeout(start, 600);
      return () => clearTimeout(t);
    }
  }, []);

  return null;
}
