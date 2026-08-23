export type SeatBundle = { id: string; label: string; priceCents: number; features: string[] };

export const seatBundles: SeatBundle[] = [
  { id: "standard", label: "Standard seat", priceCents: 0, features: ["Seat assigned at check-in"] },
  { id: "extra-legroom", label: "Extra legroom", priceCents: 6900, features: ["More room", "Priority boarding"] },
  { id: "front-cabin", label: "Front cabin", priceCents: 9900, features: ["Front rows", "Priority boarding"] }
];

export function scoreSeatBundles(bundles: SeatBundle[], preferredId?: string): SeatBundle[] {
  return [...bundles].sort((a, b) => Number(b.id === preferredId) - Number(a.id === preferredId) || a.priceCents - b.priceCents);
}
