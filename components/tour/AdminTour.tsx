"use client";

import { useEffect } from "react";
import { createTour, shouldAutoStart } from "./tour";
import TourButton from "./TourButton";

function start(firstLeadId: string | null) {
  const tour = createTour([
    {
      popover: {
        title: "The lead pipeline",
        description:
          "Everything submitted on the public site lands here, ready to work. This is where leads turn into booked jobs.",
      },
    },
    {
      element: "#tour-stats",
      popover: {
        title: "Pipeline at a glance",
        description:
          "Live counts by lead status. Each card is clickable — it filters the whole page to that status.",
        side: "bottom",
      },
    },
    {
      element: "#tour-map",
      popover: {
        title: "Geographic view",
        description:
          "Every lead plotted where the dig actually is, color-coded by status. Density shows where to focus crews — or where to sell territories.",
        side: "bottom",
      },
    },
    {
      element: "#tour-filters",
      popover: {
        title: "Cut the list down",
        description:
          "Filter by status or project type, sort by date. Simple tools for working the list top to bottom.",
        side: "bottom",
      },
    },
    {
      element: "#tour-table",
      popover: {
        title: "The job list",
        description:
          "Newest first, with the fields that matter for a go/no-go call: project, budget, timeline, and status.",
        side: "top",
      },
    },
    firstLeadId
      ? {
          popover: {
            title: "Drill into a lead",
            description:
              "Each row opens the full job sheet — let's open one.",
            nextBtnText: "Open a lead →",
            onNextClick: () => {
              window.location.assign(`/admin/leads/${firstLeadId}?tour=1`);
            },
          },
        }
      : {
          popover: {
            title: "That's the pipeline",
            description:
              "Click any lead to see full details, the exact site on a map, and status controls.",
          },
        },
  ]);
  tour.drive();
}

export default function AdminTour({ firstLeadId }: { firstLeadId: string | null }) {
  useEffect(() => {
    if (shouldAutoStart()) {
      const t = setTimeout(() => start(firstLeadId), 600);
      return () => clearTimeout(t);
    }
  }, [firstLeadId]);

  return <TourButton onClick={() => start(firstLeadId)} />;
}
