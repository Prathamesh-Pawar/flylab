export type Flight = {
  id: string;
  origin: "SFO";
  destination: "JFK";
  departureAt: string;
  arrivalAt: string;
  stops: number;
  fareCents: number;
};

export const flights: Flight[] = [
  { id: "FL-204", origin: "SFO", destination: "JFK", departureAt: "2026-09-04T08:10:00-07:00", arrivalAt: "2026-09-04T16:41:00-04:00", stops: 0, fareCents: 42800 },
  { id: "FL-318", origin: "SFO", destination: "JFK", departureAt: "2026-09-04T09:05:00-07:00", arrivalAt: "2026-09-04T18:02:00-04:00", stops: 1, fareCents: 36400 },
  { id: "FL-427", origin: "SFO", destination: "JFK", departureAt: "2026-09-04T11:20:00-07:00", arrivalAt: "2026-09-04T19:49:00-04:00", stops: 0, fareCents: 48700 },
  { id: "FL-512", origin: "SFO", destination: "JFK", departureAt: "2026-09-04T13:15:00-07:00", arrivalAt: "2026-09-04T22:08:00-04:00", stops: 1, fareCents: 34900 },
  { id: "FL-638", origin: "SFO", destination: "JFK", departureAt: "2026-09-04T15:40:00-07:00", arrivalAt: "2026-09-05T00:15:00-04:00", stops: 0, fareCents: 51200 },
  { id: "FL-746", origin: "SFO", destination: "JFK", departureAt: "2026-09-04T18:30:00-07:00", arrivalAt: "2026-09-05T03:18:00-04:00", stops: 1, fareCents: 33100 }
];
