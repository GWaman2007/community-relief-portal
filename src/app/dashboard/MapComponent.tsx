import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/lib/supabaseClient";

// Custom Icon Setup globally defining deterministic dynamic statuses
const criticalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});
const dispatchedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});
const resolvedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const getIcon = (status: string) => {
  if (status === 'dispatched') return dispatchedIcon;
  if (status === 'resolved') return resolvedIcon;
  return criticalIcon;
};

const SEMANTIC_NODES = [
  "All",
  "Public Health",
  "Water & Sanitation",
  "Infrastructure",
  "Food Security",
  "Education",
  "Emergency Relief"
];

export default function MapComponent({ filterNode }: { filterNode?: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filterNode || "All");

  useEffect(() => {
    async function fetchAuth() {
      const { data } = await supabase.auth.getUser();
      setIsAdmin(data?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
    }
    fetchAuth();

    async function fetchReports() {
      // Data Cascade: Safely load all geographic nodes via Left Join evaluating authorization post-query protecting legacy testing nodes
      let query = supabase
        .from("reports")
        .select("*, notifications(*), ngos(is_authorized)")
        .order("created_at", { ascending: false });

      if (activeFilter && activeFilter !== "All") {
        query = query.eq("semantic_node", activeFilter);
      }
      
      const { data, error } = await query;
      if (!error && data) {
        // Fallback Javascript Data Cascade resolving NULL structures globally
        const safeReports = data.filter(r => !r.ngo_id || r.ngos?.is_authorized);
        setReports(safeReports);
      }
    }
    fetchReports();
    
    // Set up realtime subscriptions
    const channel1 = supabase.channel("live-reports").on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, fetchReports).subscribe();
    const channel2 = supabase.channel("live-notifs").on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchReports).subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, [activeFilter, filterNode]);

  const handleDispatch = async (report: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alert("System Auth Token Required.");

      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          report_id: report.id,
          lat: report.latitude,
          lng: report.longitude,
          semantic_node: report.semantic_node,
          problem_title: report.problem_title
        })
      });
      const data = await res.json();
      if (res.ok) alert(data.message || `Dispatch successful.`);
      else alert("Dispatch Error: " + data.error);
    } catch (e) {
      alert("Failed to reach dispatch API");
    }
  };

  const handleResolve = async (report_id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alert("System Auth Token Required.");

      const res = await fetch("/api/admin/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ report_id })
      });
      const data = await res.json();
      if (res.ok) alert(data.message || `Crisis Resolved.`);
      else alert("Resolution Error: " + data.error);
    } catch (e) {
      alert("Failed to reach resolution API");
    }
  };

  return (
    <div className="w-full h-[500px] border-4 border-slate-700/50 rounded-xl shadow-2xl relative">
      <div className="absolute top-4 right-4 z-[1000]">
        <select 
          value={activeFilter} 
          onChange={(e) => setActiveFilter(e.target.value)}
          className="bg-slate-800 text-white border border-slate-600 rounded px-3 py-2 text-sm font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {SEMANTIC_NODES.map(node => (
            <option key={node} value={node}>{node === "All" ? "🌍 Global Feed" : node}</option>
          ))}
        </select>
      </div>

      <MapContainer center={[19.0760, 72.8777]} zoom={10} attributionControl={false} style={{ height: "100%", width: "100%" }} className="bg-slate-900 rounded-lg">
        <TileLayer url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png" />
        <MarkerClusterGroup chunkedLoading>
          {reports.map(report => {
            const total_dispatched = report.notifications?.length || 0;
            const total_accepted = report.notifications?.filter((n: any) => n.status === 'accept').length || 0;

            return (
              <Marker key={report.id} position={[report.latitude, report.longitude]} icon={getIcon(report.status)}>
                <Popup autoPan={false} className="custom-popup leaflet-popup-override">
                  <div className="p-3 pt-5 w-64 bg-white rounded-lg pointer-events-auto">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-2 mb-2">
                      <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px] bg-slate-100 px-2 py-1 rounded shadow-sm border border-slate-200">
                        {report.semantic_node}
                      </span>
                      <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded shadow-sm border ${report.status === 'dispatched' ? 'bg-amber-100 text-amber-700 border-amber-200' : report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {report.status || 'critical'}
                      </span>
                    </div>

                    <h3 className="font-black text-[15px] leading-tight mb-2 text-slate-900">{report.problem_title}</h3>
                    
                    {/* Phase 12 Database Mapping Hotfix */}
                    <div className="max-h-32 overflow-y-auto pr-2 mb-3 text-slate-700 text-xs leading-relaxed border-l-2 border-slate-300 pl-2">
                      <p className="text-sm font-medium">{report.original_text || 'No field description recorded.'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-50 border border-slate-200 p-1.5 rounded text-center shadow-sm">
                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-wider">Urgency</span>
                        <span className="text-[13px] font-black text-rose-600">{report.urgency_rating || 'N/A'}<span className="text-[10px] text-slate-400">/10</span></span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-1.5 rounded text-center shadow-sm">
                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-wider">Impact</span>
                        <span className="text-[13px] font-black text-rose-600">{report.importance_rating || 'N/A'}<span className="text-[10px] text-slate-400">/10</span></span>
                      </div>
                      <div className="col-span-2 bg-slate-50 border border-slate-200 p-1.5 rounded text-center shadow-sm">
                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-wider">AI Deduplication Engine</span>
                        <span className="text-[11px] font-black tracking-widest text-indigo-600 uppercase pt-0.5 inline-block">{report.is_duplicate ? 'Confirmed Duplicate' : 'Original Event Node'}</span>
                      </div>
                    </div>
                    
                    {report.image_base64 && (
                      <div className="mt-3">
                        <img src={report.image_base64} alt="Report image" className="w-full h-24 object-cover rounded border border-slate-200" />
                      </div>
                    )}

                    {total_dispatched > 0 && report.status !== 'resolved' && (
                      <div className="mt-3 text-center bg-emerald-50 py-2 rounded border border-emerald-200 shadow-sm">
                         <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Operatives</span>
                         <span className="text-xl font-black text-emerald-800">{total_accepted} <span className="text-emerald-600/50 text-sm">/ {total_dispatched}</span></span>
                         <span className="block text-[9px] text-emerald-600/70 uppercase">Volunteers Responded</span>
                      </div>
                    )}

                    {report.status === 'resolved' && (
                      <div className="mt-3 text-center bg-emerald-600 p-2 rounded shadow-sm text-white font-black tracking-widest uppercase text-[12px]">
                        ✔ CRISIS RESOLVED & VERIFIED
                      </div>
                    )}

                    {isAdmin && report.status !== 'resolved' && (
                      <>
                        <button 
                          onClick={() => handleDispatch(report)}
                          disabled={report.status === 'dispatched'}
                          className={`w-full mt-3 font-bold tracking-wide text-[11px] uppercase py-2.5 rounded shadow-sm transition-colors ${report.status === 'dispatched' ? 'bg-amber-500 text-white cursor-not-allowed' : 'bg-rose-600 hover:bg-slate-800 text-white'}`}
                        >
                          {report.status === 'dispatched' ? "Dispatch More Teams" : "Authorize Dispatch"}
                        </button>
                        
                        {report.status === 'dispatched' && (
                          <button 
                            onClick={() => handleResolve(report.id)}
                            className="w-full mt-2 font-black tracking-wide text-[12px] uppercase py-2 rounded shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors border-2 border-emerald-600"
                          >
                            ✔ MARK RESOLVED
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
