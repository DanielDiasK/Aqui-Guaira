import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MapPin, Crosshair, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

type EmpresaForMap = {
  id: string;
  nome: string;
  latitude: number | null;
  longitude: number | null;
  bairro?: string | null;
  categoria_nome?: string | null;
  logo?: string | null;
};

const FALLBACK_CENTER = { lat: -20.3197, lng: -48.3118 };

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function ensureLeafletLoaded() {
  const w = window as any;
  if (w.L) return w.L;

  if (!document.querySelector('link[data-leaflet]')) {
    const link = document.createElement('link');
    link.setAttribute('data-leaflet', 'true');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-leaflet]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      if ((window as any).L) resolve();
      return;
    }
    const script = document.createElement('script');
    script.setAttribute('data-leaflet', 'true');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Leaflet'));
    document.body.appendChild(script);
  });
  return (window as any).L;
}

const MapSearch = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  // raio em metros
  const [radiusMeters, setRadiusMeters] = useState<number>(5000);
  const [unit, setUnit] = useState<'m' | 'km'>("m");
  const [loadingMap, setLoadingMap] = useState(true);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [empresas, setEmpresas] = useState<EmpresaForMap[]>([]);
  const personMarkerRef = useRef<any>(null);

  useEffect(() => {
    const fetchEmpresas = async () => {
      setLoadingEmpresas(true);
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select(`
            id,
            nome,
            latitude,
            longitude,
            bairro,
            logo,
            categorias:categoria_id(nome)
          `)
          .eq('status', 'aprovado')
          .limit(500);

        if (error) throw error;

        const normalized: EmpresaForMap[] = (data || []).map((e: any) => ({
          id: e.id,
          nome: e.nome,
          latitude: e.latitude ?? null,
          longitude: e.longitude ?? null,
          bairro: e.bairro ?? null,
          logo: e.logo ?? null,
          categoria_nome: e.categorias?.nome ?? null,
        }));
        setEmpresas(normalized);
      } catch (err) {
        console.error('Erro ao buscar empresas:', err);
        setEmpresas([]);
      } finally {
        setLoadingEmpresas(false);
      }
    };
    fetchEmpresas();
  }, []);

  useEffect(() => {
    let disposed = false;
    const init = async () => {
      try {
        const L = await ensureLeafletLoaded();
        if (disposed) return;

        const setInitial = (pos?: GeolocationPosition) => {
          const initial = pos
            ? { lat: pos.coords.latitude, lng: pos.coords.longitude }
            : FALLBACK_CENTER;
          setCenter(initial);

          // remove zoom control (+/-)
          const map = L.map(mapRef.current!, { zoomControl: false, attributionControl: false });
          leafletMapRef.current = map;
          map.setView([initial.lat, initial.lng], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          markersLayerRef.current = L.layerGroup().addTo(map);
          circleRef.current = L.circle([initial.lat, initial.lng], {
            radius: radiusMeters,
            color: '#16a34a',
            weight: 2,
            fillColor: '#4ade80',
            fillOpacity: 0.15,
          }).addTo(map);

          // marcador do usuário no centro (arrastável)
          const userIcon = L.divIcon({
            className: 'user-center-marker',
            html: '<div style="width:20px;height:20px;border-radius:9999px;background:#16a34a;border:3px solid white;box-shadow:0 0 0 3px rgba(22,163,74,0.3);cursor:move;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          personMarkerRef.current = L.marker([initial.lat, initial.lng], { 
            icon: userIcon, 
            zIndexOffset: 1000,
            draggable: true 
          }).addTo(map);

          // Atualizar centro ao arrastar o marcador
          personMarkerRef.current.on('dragend', function() {
            const newPos = personMarkerRef.current.getLatLng();
            setCenter({ lat: newPos.lat, lng: newPos.lng });
          });

          // Permitir clicar no mapa para mover o marcador
          map.on('click', function(e: any) {
            const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
            setCenter(newPos);
            personMarkerRef.current.setLatLng([newPos.lat, newPos.lng]);
            map.setView([newPos.lat, newPos.lng], map.getZoom());
          });

          setLoadingMap(false);
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => setInitial(pos),
            () => setInitial(),
            { enableHighAccuracy: true, timeout: 6000 }
          );
        } else {
          setInitial();
        }
      } catch (e) {
        console.error(e);
        setLoadingMap(false);
      }
    };
    init();
    return () => {
      disposed = true;
      try {
        if (leafletMapRef.current) leafletMapRef.current.remove();
      } catch {}
    };
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    const map = leafletMapRef.current;
    if (!L || !map || !center) return;

    if (circleRef.current) {
      circleRef.current.setLatLng([center.lat, center.lng]);
      circleRef.current.setRadius(radiusMeters);
    }

    if (personMarkerRef.current) {
      personMarkerRef.current.setLatLng([center.lat, center.lng]);
    }

    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    const filtered = empresas.filter((e) => {
      if (e.latitude == null || e.longitude == null) return false;
      const dKm = haversineKm(center.lat, center.lng, e.latitude, e.longitude);
      return dKm * 1000 <= radiusMeters;
    });

    filtered.forEach((e) => {
      // Ícone verde para empresas
      const empresaIcon = L.divIcon({
        className: 'empresa-marker',
        html: '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="#16a34a" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
      
      const m = L.marker([e.latitude!, e.longitude!], { icon: empresaIcon });
      m.bindPopup(
        `<div style="min-width:180px">` +
        `<strong>${e.nome}</strong><br/>` +
        `${e.categoria_nome ? e.categoria_nome + ' • ' : ''}${e.bairro ?? ''}<br/>` +
        `<a href="/empresas?id=${e.id}" style="color:#16a34a;font-weight:600;">Ver detalhes</a>` +
        `</div>`
      );
      markersLayerRef.current.addLayer(m);
    });
  }, [center, radiusMeters, empresas]);

  const resultados = useMemo(() => {
    if (!center) return [] as (EmpresaForMap & { distancia: number })[];
    return empresas
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({
        ...e,
        distancia: haversineKm(center.lat, center.lng, e.latitude!, e.longitude!), // km
      }))
      .filter((e) => e.distancia * 1000 <= radiusMeters)
      .sort((a, b) => a.distancia - b.distancia);
  }, [empresas, center, radiusMeters]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCenter(next);
      const map = leafletMapRef.current;
      if (map) map.setView([next.lat, next.lng], 14);
    });
  };

  return (
    <section className="container mx-auto px-4 mt-8">
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Buscar por raio no mapa
          </CardTitle>
          <div className="mt-3">
            <Badge variant="outline" className="bg-green-50 border-green-500 text-green-700 px-3 py-2 text-sm font-medium">
              <Crosshair className="h-4 w-4 mr-2" />
              Clique no mapa ou arraste a bolinha verde para escolher sua localização e ajustar o raio de busca
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative w-full h-[320px] sm:h-[380px] rounded-xl overflow-hidden border" ref={mapRef}>
                {loadingMap && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleUseMyLocation} className="gap-2">
                  <Crosshair className="h-4 w-4" /> Usar minha localização
                </Button>
                <Badge variant="secondary" className="ml-auto">
                  {resultados.length} {resultados.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Raio de busca</span>
                  <span className="text-sm font-medium">{unit === 'm' ? `${radiusMeters} m` : `${(radiusMeters/1000).toFixed(1)} km`}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[radiusMeters]}
                    min={100}
                    max={30000}
                    step={50}
                    onValueChange={(v) => setRadiusMeters(v[0])}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1 rounded-md border px-1 py-0.5">
                    <Button type="button" variant={unit==='m' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setUnit('m')}>m</Button>
                    <Button type="button" variant={unit==='km' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setUnit('km')}>km</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Empresas no raio</span>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {loadingEmpresas && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando empresas...
                    </div>
                  )}
                  {!loadingEmpresas && resultados.length === 0 && (
                    <div className="text-sm text-muted-foreground">Nenhuma empresa encontrada neste raio.</div>
                  )}
                  {resultados.slice(0, 25).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => navigate(`/empresas?id=${e.id}`)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                          {e.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={e.logo} alt={e.nome} className="w-full h-full object-cover" />
                          ) : (
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{e.nome}</span>
                            {e.categoria_nome && (
                              <Badge variant="secondary" className="text-[10px]">{e.categoria_nome}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{e.bairro ?? 'Bairro não informado'}</span>
                            <span>•</span>
                            <span>{e.distancia * 1000 < 1000 ? `${Math.round(e.distancia * 1000)} m` : `${e.distancia.toFixed(1)} km`}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default MapSearch;


