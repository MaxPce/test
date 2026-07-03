// src/features/competitions/utils/iaaf-points.utils.ts

// Fórmulas IAAF para pruebas combinadas
// Fuente: IAAF Scoring Tables for Combined Events
// Pista (tiempo):   P = A × (B − T)^C  → menor tiempo = más puntos
// Campo (distancia):P = A × (M − B)^C  → mayor distancia = más puntos

type FormulaType = "track" | "field";

interface IaafCoefficients {
  type: FormulaType;
  A: number;
  B: number;
  C: number;
}

// Coeficientes oficiales IAAF
// Saltos:       marca en centímetros (B en cm)
// Lanzamientos: marca en metros     (B en m)
// Carreras:     marca en segundos   (B en s)

const HEPTATLON_COEFFICIENTS: Record<string, IaafCoefficients> = {
  "100m vallas":             { type: "track", A: 9.23076,  B: 26.7,  C: 1.835 },
  "salto alto":              { type: "field", A: 1.84523,  B: 75.0,  C: 1.348 }, // cm
  "lanzamiento de bala":     { type: "field", A: 56.0211,  B: 1.50,  C: 1.05  }, // m
  "200m":                    { type: "track", A: 4.99087,  B: 42.5,  C: 1.81  },
  "salto largo":             { type: "field", A: 0.188807, B: 210.0, C: 1.41  }, // cm
  "lanzamiento de jabalina": { type: "field", A: 15.9803,  B: 3.80,  C: 1.04  }, // m
  "800m":                    { type: "track", A: 0.11193,  B: 254.0, C: 1.88  },
};

const DECATLON_COEFFICIENTS: Record<string, IaafCoefficients> = {
  "100m":                    { type: "track", A: 25.4347,  B: 18.0,  C: 1.81  },
  "salto largo":             { type: "field", A: 0.14354,  B: 220.0, C: 1.40  }, // cm
  "lanzamiento de bala":     { type: "field", A: 51.39,    B: 1.50,  C: 1.05  }, // m
  "salto alto":              { type: "field", A: 0.8465,   B: 75.0,  C: 1.42  }, // cm
  "400m":                    { type: "track", A: 1.53775,  B: 82.0,  C: 1.81  },
  "110m vallas":             { type: "track", A: 5.74352,  B: 28.5,  C: 1.92  },
  "lanzamiento de disco":    { type: "field", A: 12.91,    B: 4.00,  C: 1.10  }, // m
  "salto con pertiga":       { type: "field", A: 0.2797,   B: 100.0, C: 1.35  }, // cm ← sin tilde para que normalize() haga match
  "lanzamiento de jabalina": { type: "field", A: 10.14,    B: 7.00,  C: 1.08  }, // m
  "1500m":                   { type: "track", A: 0.03768,  B: 480.0, C: 1.85  },
};

// Convierte "MM:SS.ss" o "SS.ss" a segundos
function timeToSeconds(time: string): number {
  const parts = time.split(":");
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(time);
}

// Normaliza nombres para hacer match con las keys (quita tildes, minúsculas)
function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, " ")           
    .replace(/(\d)\s+m\b/g, "$1m")  
    .replace(/\blisos\b/g, "")      
    .trim();
}

export function calcIaafPoints(
    
  mark: string | null,
  subEventName: string,
  gender: "M" | "F",
): number {
    console.log("subEventName:", JSON.stringify(subEventName), "mark:", JSON.stringify(mark));

  if (!mark) return 0;

  const table =
    gender === "F" ? HEPTATLON_COEFFICIENTS : DECATLON_COEFFICIENTS;

  const key = Object.keys(table).find(
    (k) => normalize(k) === normalize(subEventName),
  );
  if (!key) return 0;

  const { type, A, B, C } = table[key];

  if (type === "track") {
    const T = timeToSeconds(mark);
    const diff = B - T;
    if (diff <= 0) return 0;
    return Math.floor(A * Math.pow(diff, C));
  }

  // field: saltos en cm, lanzamientos en m
  const key_norm = normalize(key);
  const isJump =
    key_norm.includes("largo") ||
    key_norm.includes("alto") ||
    key_norm.includes("pertiga") ||
    key_norm.includes("triple");

  const M = isJump ? parseFloat(mark) * 100 : parseFloat(mark);
  const diff = M - B;
  if (diff <= 0) return 0;
  return Math.floor(A * Math.pow(diff, C));
}