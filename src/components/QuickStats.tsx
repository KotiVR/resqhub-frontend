export default function QuickStats() {
  const stats = [
    { value: "< 8 min", label: "Avg. Ambulance Response", icon: "🚑" },
    { value: "24/7", label: "Emergency Availability", icon: "⏰" },
    { value: "6+", label: "Emergency Services Listed", icon: "📞" },
    { value: "100%", label: "Free to Use", icon: "💛" },
  ];

  return (
    <section className="bg-secondary py-6 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-primary font-extrabold text-xl md:text-2xl">{stat.value}</div>
              <div className="text-secondary-foreground/70 text-xs md:text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
