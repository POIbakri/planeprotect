import { createClient } from '@supabase/supabase-js';
import { getErrorMessage } from './utils';
import { cache } from './cache';
import { logger } from './logger';
import { metrics } from './metrics';
import { handleApiError } from './errors';
import { sendEmail } from './email';
import { EligibilityChecker } from './eligibility';
import type { 
  FlightCheckResponse,
  PaginatedResponse,
  Claim,
  ClaimFilters,
  AviationStackResponse,
  AviationStackFlight,
  DisruptionReason,
  DisruptionType,
  DisruptionDetails,
  Airport,
  Airline,
  FlightData,
  CompensationResult,
  FlightRoute
} from './types';

// Flight distances in kilometers for common routes
const flightDistances: Record<string, number> = {
  // UK Routes
  'LHRJFK': 5556, // London Heathrow to New York JFK
  'LHRDXB': 5500, // London Heathrow to Dubai
  'LHRCDG': 344,  // London Heathrow to Paris Charles de Gaulle
  'LHRFRA': 650,  // London Heathrow to Frankfurt
  'LHRAMS': 357,  // London Heathrow to Amsterdam
  'LHRMAD': 1260, // London Heathrow to Madrid
  'LHRFCO': 1430, // London Heathrow to Rome
  'LHRDUB': 464,  // London Heathrow to Dublin
  'LHRATH': 2458, // London to Athens
  'LHRIST': 2550, // London to Istanbul
  'LHRLAX': 8780, // London to Los Angeles
  'LHRSFO': 8640, // London to San Francisco
  'LHRSYD': 16991, // London to Sydney
  'LHRHKG': 9648, // London to Hong Kong
  'LHRSEA': 4784, // London to Seattle
  'LHRSIN': 10885, // London to Singapore
  'LHRBKK': 9578, // London to Bangkok
  'LHRGVA': 754, // London to Geneva
  'LHRZRH': 789, // London to Zurich
  'LHRLIS': 1639, // London to Lisbon
  'LHRBCN': 1137, // London to Barcelona
  'LHRMLA': 2105, // London to Malta
  'LHRPRG': 1044, // London to Prague
  'LHRCPH': 955, // London to Copenhagen
  'LHRSVO': 1794, // London to Moscow
  'LHRWAW': 1451, // London to Warsaw
  'LHRKRK': 1557, // London to Krakow
  'LHRBUD': 1458, // London to Budapest
  'LHRHEL': 1822, // London to Helsinki
  'LHRARN': 1440, // London to Stockholm
  'LHRTLV': 3574, // London to Tel Aviv
  'LHRCAI': 3530, // London to Cairo
  'LHRRIX': 1649, // London to Riga
  'LHREVN': 3719, // London to Yerevan
  'LHRGYD': 5400, // London to Baku
  'LHRTBS': 3224, // London to Tbilisi
  'LHRDEL': 6700, // London to Delhi
  'LHRBOM': 7200, // London to Mumbai
  'LHRGRU': 9450, // London to Sao Paulo
  'LHREZE': 10980, // London to Buenos Aires
  'LHRJNB': 9000, // London to Johannesburg
  'LHRCPT': 9635, // London to Cape Town
  'LHRYYZ': 5500, // London to Toronto
  'LHRYVR': 7585, // London to Vancouver
  'LHRMEX': 8910, // London to Mexico City
  'LHRGIG': 9300, // London to Rio de Janeiro
  'LHRDOH': 5220, // London to Doha
  'LHRAUH': 5625, // London to Abu Dhabi
  'LHRMEL': 16915, // London to Melbourne
  'LHRBNE': 16560, // London to Brisbane
  'LHRPER': 14485, // London to Perth
  'LHRAKL': 18335, // London to Auckland
  'LHRSCL': 11645, // London to Santiago
  'LHRICN': 8870, // London to Seoul
  'LHRKUL': 10605, // London to Kuala Lumpur
  'LHRMRU': 9900, // London to Mauritius
  'LHRMNL': 10755, // London to Manila
  'LHRGUM': 11935, // London to Guam
  'LHRCGK': 11725, // London to Jakarta
  'LHRSGU': 8890, // London to Guangzhou
  'LHRPVG': 9195, // London to Shanghai
  'LHRPEK': 8150, // London to Beijing
  
  // Gatwick routes
  'LGWJFK': 5560, // London Gatwick to New York
  'LGWMCO': 7025, // London Gatwick to Orlando
  'LGWBGI': 6760, // London Gatwick to Bridgetown (Barbados)
  'LGWCUN': 8145, // London Gatwick to Cancun
  'LGWMIA': 7125, // London Gatwick to Miami
  'LGWFNC': 2480, // London Gatwick to Funchal (Madeira)
  
  // Manchester routes
  'MANJFK': 5370, // Manchester to New York
  'MANDXB': 5730, // Manchester to Dubai
  'MANORD': 6220, // Manchester to Chicago
  'MANDOH': 5310, // Manchester to Doha
  'MANSFO': 8585, // Manchester to San Francisco
  'MANBOS': 5235, // Manchester to Boston
  
  // Edinburgh routes
  'EDINYC': 5285, // Edinburgh to New York
  'EDIDUB': 350, // Edinburgh to Dublin
  'EDILON': 535, // Edinburgh to London
  'EDIAMS': 715, // Edinburgh to Amsterdam
  'EDIFRA': 1025, // Edinburgh to Frankfurt
  
  // Paris Routes
  'CDGJFK': 5830, // Paris to New York
  'CDGDXB': 5200, // Paris to Dubai
  'CDGFRA': 450,  // Paris to Frankfurt
  'CDGAMS': 430,  // Paris to Amsterdam
  'CDGMAD': 1050, // Paris to Madrid
  'CDGFCO': 1100, // Paris to Rome
  'CDGDUB': 780,  // Paris to Dublin
  'CDGLHR': 344,  // Paris to London
  'CDGIST': 2229, // Paris to Istanbul
  'CDGLAX': 9124, // Paris to Los Angeles
  'CDGBCN': 831,  // Paris to Barcelona
  'CDGATH': 2101, // Paris to Athens
  'CDGLIS': 1452, // Paris to Lisbon
  'CDGHKG': 9614, // Paris to Hong Kong
  'CDGMIA': 7552, // Paris to Miami
  'CDGPEK': 8215, // Paris to Beijing
  'CDGSIN': 10725, // Paris to Singapore
  'CDGGRU': 9400, // Paris to Sao Paulo
  'CDGBOM': 6950, // Paris to Mumbai
  'CDGDEL': 6585, // Paris to Delhi
  'CDGMEX': 9105, // Paris to Mexico City
  'CDGCUN': 8225, // Paris to Cancun
  'CDGPTP': 6790, // Paris to Pointe-à-Pitre (Guadeloupe)
  'CDGREU': 9370, // Paris to Saint-Denis (Reunion)
  'CDGCDG': 5430, // Paris to Madagascar
  'CDGTFS': 3285, // Paris to Tenerife
  'CDGCPT': 9400, // Paris to Cape Town
  'CDGNBO': 6515, // Paris to Nairobi
  
  // German Routes
  'FRAJFK': 6200, // Frankfurt to New York
  'FRADXB': 4800, // Frankfurt to Dubai
  'FRAAMS': 350,  // Frankfurt to Amsterdam
  'FRAMAD': 1800, // Frankfurt to Madrid
  'FRAFCO': 1000, // Frankfurt to Rome
  'FRADUB': 1050, // Frankfurt to Dublin
  'FRALHR': 650,  // Frankfurt to London
  'FRACDG': 450,  // Frankfurt to Paris
  'FRAIST': 1867, // Frankfurt to Istanbul
  'FRASIN': 9374, // Frankfurt to Singapore
  'FRACAI': 2896, // Frankfurt to Cairo
  'FRAHKG': 9230, // Frankfurt to Hong Kong
  'FRAPEK': 7785, // Frankfurt to Beijing
  'FRASFO': 9136, // Frankfurt to San Francisco
  'FRAAKL': 9974, // Frankfurt to Auckland
  'FRANBO': 6430, // Frankfurt to Nairobi
  'FRAPTV': 6990, // Frankfurt to Punta Cana
  'FRACCS': 8455, // Frankfurt to Caracas
  'FRAEZE': 11105, // Frankfurt to Buenos Aires
  'FRABKK': 8930, // Frankfurt to Bangkok
  'FRAMLE': 8185, // Frankfurt to Male (Maldives)
  'FRAMEX': 9635, // Frankfurt to Mexico City
  'FRAGRB': 2705, // Frankfurt to Granada
  'FRACTA': 2010, // Frankfurt to Catania
  'FRAFNC': 3125, // Frankfurt to Funchal (Madeira)
  'FRACMN': 1375, // Frankfurt to Casablanca
  
  // Madrid Routes
  'MADLHR': 1260, // Madrid to London
  'MADCDG': 1050, // Madrid to Paris
  'MADFRA': 1800, // Madrid to Frankfurt
  'MADJFK': 5754, // Madrid to New York
  'MADBOG': 8048, // Madrid to Bogota
  'MADLIS': 501,  // Madrid to Lisbon
  'MADFCO': 1364, // Madrid to Rome
  'MADAMS': 1460, // Madrid to Amsterdam
  'MADGRU': 8369, // Madrid to Sao Paulo
  'MADEZX': 2612, // Madrid to Buenos Aires
  'MADMIA': 7106, // Madrid to Miami
  'MADDXB': 5839, // Madrid to Dubai
  'MADMEX': 8970, // Madrid to Mexico City
  'MADLIM': 9520, // Madrid to Lima
  'MADSCL': 11250, // Madrid to Santiago
  'MADCCS': 7050, // Madrid to Caracas
  'MADSDQ': 6745, // Madrid to Santo Domingo
  'MADSJO': 9705, // Madrid to San Jose
  'MADHAV': 7385, // Madrid to Havana
  'MADPTY': 8320, // Madrid to Panama City
  'MADQUI': 8790, // Madrid to Quito
  'MADCMN': 850, // Madrid to Casablanca
  'MADRAK': 980, // Madrid to Marrakech
  'MADTFN': 1775, // Madrid to Tenerife
  'MADGCT': 7125, // Madrid to Guatemala City
  
  // Rome Routes
  'FCOLHR': 1430, // Rome to London
  'FCOCDG': 1100, // Rome to Paris
  'FCOFRA': 1000, // Rome to Frankfurt
  'FCOMAD': 1364, // Rome to Madrid
  'FCOJFK': 6902, // Rome to New York
  'FCOATH': 1052, // Rome to Athens
  'FCOIST': 1369, // Rome to Istanbul
  'FCOBEY': 2229, // Rome to Beirut
  'FCOTEL': 2273, // Rome to Tel Aviv
  'FCOCAI': 2065, // Rome to Cairo
  'FCOGOA': 7515, // Rome to Goa
  'FCOMLE': 6700, // Rome to Male
  'FCOHAV': 8490, // Rome to Havana
  'FCODXB': 4340, // Rome to Dubai
  'FCOSIN': 10125, // Rome to Singapore
  'FCOBUE': 11135, // Rome to Buenos Aires
  'FCORIO': 9175, // Rome to Rio de Janeiro
  'FCODPS': 12030, // Rome to Bali
  'FCOBKK': 8700, // Rome to Bangkok
  'FCOMLA': 1290, // Rome to Malta
  'FCOTGD': 555, // Rome to Podgorica
  'FCOTIA': 1965, // Rome to Tirana
  
  // Amsterdam Routes
  'AMSLHR': 357,  // Amsterdam to London
  'AMSCDG': 430,  // Amsterdam to Paris
  'AMSFRA': 350,  // Amsterdam to Frankfurt
  'AMSMAD': 1460, // Amsterdam to Madrid
  'AMSFCO': 1300, // Amsterdam to Rome
  'AMSDUB': 750,  // Amsterdam to Dublin
  'AMSJFK': 5878, // Amsterdam to New York
  'AMSATL': 7102, // Amsterdam to Atlanta
  'AMSYYZ': 5873, // Amsterdam to Toronto
  'AMSKUL': 8008, // Amsterdam to Kuala Lumpur
  'AMSGRU': 9780, // Amsterdam to Sao Paulo
  'AMSNBO': 6555, // Amsterdam to Nairobi
  'AMSCPT': 9336, // Amsterdam to Cape Town
  'AMSIST': 2210, // Amsterdam to Istanbul
  'AMSDXB': 5160, // Amsterdam to Dubai
  'AMSKIX': 8990, // Amsterdam to Osaka
  'AMSBKK': 9185, // Amsterdam to Bangkok
  'AMSSIN': 10510, // Amsterdam to Singapore
  'AMSHKG': 9320, // Amsterdam to Hong Kong
  'AMSCUR': 7845, // Amsterdam to Curacao
  'AMSARUBA': 7760, // Amsterdam to Aruba
  'AMSRIX': 1610, // Amsterdam to Riga
  'AMSVNO': 1560, // Amsterdam to Vilnius
  'AMSWAW': 1090, // Amsterdam to Warsaw
  'AMSKVS': 8895, // Amsterdam to Kilimanjaro
  'AMSCMB': 7935, // Amsterdam to Colombo
  'AMSDEL': 6340, // Amsterdam to Delhi
  'AMSACC': 4895, // Amsterdam to Accra
  'AMSLUN': 7415, // Amsterdam to Lusaka
  
  // Dublin Routes
  'DUBLHR': 464,  // Dublin to London
  'DUBCDG': 780,  // Dublin to Paris
  'DUBFRA': 1050, // Dublin to Frankfurt
  'DUBMAD': 1450, // Dublin to Madrid
  'DUBAMS': 750,  // Dublin to Amsterdam
  'DUBJFK': 5127, // Dublin to New York
  'DUBBOS': 4814, // Dublin to Boston
  'DUBORD': 5835, // Dublin to Chicago
  'DUBPHL': 5203, // Dublin to Philadelphia
  'DUBMCO': 6312, // Dublin to Orlando
  'DUBLAX': 8351, // Dublin to Los Angeles
  'DUBSFO': 8207, // Dublin to San Francisco
  'DUBYWG': 5129,  // Dublin to Winnipeg
  'DUBIST': 2950, // Dublin to Istanbul
  'DUBDXB': 5860, // Dublin to Dubai
  'DUBWAW': 1790, // Dublin to Warsaw
  'DUBHEL': 2010, // Dublin to Helsinki
  'DUBLIS': 1645, // Dublin to Lisbon
  'DUBATH': 2865, // Dublin to Athens
  
  // Turkish and Middle East Routes
  'ISTLHR': 2550, // Istanbul to London
  'ISTJFK': 8040, // Istanbul to New York
  'ISTGRU': 10960, // Istanbul to Sao Paulo
  'ISTCPT': 7640, // Istanbul to Cape Town
  'ISTSIN': 8625, // Istanbul to Singapore
  'ISTBKK': 7570, // Istanbul to Bangkok
  
  'DXBLHR': 5500, // Dubai to London
  'DXBJFK': 11000, // Dubai to New York
  'DXBSIN': 5880, // Dubai to Singapore
  'DXBSYD': 12050, // Dubai to Sydney
  'DXBJNB': 6420, // Dubai to Johannesburg
  'DXBMAA': 3625, // Dubai to Chennai
  'DXBDPS': 7305, // Dubai to Bali
  'DXBGVA': 4925, // Dubai to Geneva
  'DXBKWI': 875, // Dubai to Kuwait
  'DXBAMM': 1920, // Dubai to Amman
  'DXBMLE': 2935, // Dubai to Male
  'DXBPEW': 1590, // Dubai to Peshawar
  'DXBKHI': 1060, // Dubai to Karachi
  'DXBBKK': 4895, // Dubai to Bangkok
  'DXBMNL': 6880, // Dubai to Manila
  'DXBGRJ': 4795, // Dubai to Rio de Janeiro
  'DXBCAI': 2405, // Dubai to Cairo
  'DXBIST': 3255, // Dubai to Istanbul
  'DXBMOW': 3640, // Dubai to Moscow
  
  // American Routes
  'JFKLHR': 5556, // New York to London
  'JFKCDG': 5830, // New York to Paris
  'JFKFRA': 6200, // New York to Frankfurt
  'JFKMAD': 5754, // New York to Madrid
  'JFKFCO': 6902, // New York to Rome
  'JFKIST': 8040, // New York to Istanbul
  'JFKDXB': 11000, // New York to Dubai
  'JFKGRU': 7695, // New York to Sao Paulo
  'JFKEZE': 8515, // New York to Buenos Aires
  'JFKLAX': 3940, // New York to Los Angeles
  'JFKSFO': 4140, // New York to San Francisco
  'JFKORD': 1180, // New York to Chicago
  'JFKDFW': 2300, // New York to Dallas
  'JFKIAH': 2300, // New York to Houston
  'JFKSEA': 3900, // New York to Seattle
  'JFKYYZ': 550,  // New York to Toronto
  'JFKYUL': 550,  // New York to Montreal
  'JFKYVR': 3900, // New York to Vancouver
  'JFKFLL': 1700, // New York to Fort Lauderdale
  'JFKMIA': 1800, // New York to Miami
  'JFKATL': 1200, // New York to Atlanta
  'JFKPDX': 3900, // New York to Portland
  'JFKPHX': 3400, // New York to Phoenix
  'JFKLAS': 3600, // New York to Las Vegas
  'JFKANC': 5400, // New York to Anchorage
  'JFKHNL': 8000, // New York to Honolulu
  
  // Asian Routes
  'HKGLHR': 9648, // Hong Kong to London
  'HKGJFK': 13000, // Hong Kong to New York
  'HKGLAX': 11600, // Hong Kong to Los Angeles
  'HKGCDG': 9614, // Hong Kong to Paris
  'HKGFRA': 9230, // Hong Kong to Frankfurt
  'HKGSYD': 7400, // Hong Kong to Sydney
  'HKGSIN': 2600, // Hong Kong to Singapore
  'HKGBKK': 1700, // Hong Kong to Bangkok
  'HKGDEL': 3700, // Hong Kong to Delhi
  
  // Australia and New Zealand Routes
  'SYDLHR': 16991, // Sydney to London
  'SYDLAX': 12050, // Sydney to Los Angeles
  'SYDDXB': 12050, // Sydney to Dubai
  'SYDHKG': 7400, // Sydney to Hong Kong
  'SYDSIN': 6300, // Sydney to Singapore
  'SYDAKL': 2170, // Sydney to Auckland
  'SYDNRT': 7840, // Sydney to Tokyo
  'SYDBKK': 7520, // Sydney to Bangkok
  
  // South American Routes
  'GRULHR': 9450, // Sao Paulo to London
  'GRUJFK': 7695, // Sao Paulo to New York
  'GRUMAD': 8369, // Sao Paulo to Madrid
  'GRUEZE': 1700, // Sao Paulo to Buenos Aires
  'GRUCDG': 9400, // Sao Paulo to Paris
  'GRUFRA': 9500, // Sao Paulo to Frankfurt
  'GRUDXB': 11750, // Sao Paulo to Dubai
  
  // African Routes
  'CPTZRH': 9050, // Cape Town to Zurich
  'CPTLHR': 9635, // Cape Town to London
  'CPTFRK': 8750, // Cape Town to Frankfurt
  'CPTAMS': 9336, // Cape Town to Amsterdam
  'CPTDXB': 7535, // Cape Town to Dubai
  'CPTJNB': 1270, // Cape Town to Johannesburg
  'CPTIST': 7640, // Cape Town to Istanbul
  
  'JNBLHR': 9000, // Johannesburg to London
  'JNBFRA': 8600, // Johannesburg to Frankfurt
  'JNBCDG': 8450, // Johannesburg to Paris
  'JNBAMS': 8900, // Johannesburg to Amsterdam
  'JNBDXB': 6420, // Johannesburg to Dubai
  'JNBHKG': 10750, // Johannesburg to Hong Kong
  'JNBSIN': 8415, // Johannesburg to Singapore
  'JNBGRU': 7550, // Johannesburg to Sao Paulo
  
  // Other important routes
  'DELAUH': 2175, // Delhi to Abu Dhabi
  'DELLHR': 6700, // Delhi to London
  'DELCDG': 6585, // Delhi to Paris
  'DELFRA': 6120, // Delhi to Frankfurt
  'DELBKK': 2575, // Delhi to Bangkok
  'DELSIN': 4160, // Delhi to Singapore
  'DELHKG': 3700, // Delhi to Hong Kong
  
  'SINLHR': 10885, // Singapore to London
  'SINJFK': 15350, // Singapore to New York
  'SINCDG': 10725, // Singapore to Paris
  'SINFRA': 10265, // Singapore to Frankfurt
  'SINDXB': 5880, // Singapore to Dubai
  'SINHKG': 2600, // Singapore to Hong Kong
  'SINSYD': 6300, // Singapore to Sydney
  'SINAKL': 8410, // Singapore to Auckland
  'SINPER': 3915, // Singapore to Perth
  'SINBOM': 3925, // Singapore to Mumbai
  
  'BKKLHR': 9578, // Bangkok to London
  'BKKFRA': 8930, // Bangkok to Frankfurt
  'BKKAMS': 9185, // Bangkok to Amsterdam
  'BKKCDG': 9310, // Bangkok to Paris
  'BKKARQ': 10355, // Bangkok to Arequipa
  'BKKAKL': 9545, // Bangkok to Auckland
  'BKKBNE': 7580, // Bangkok to Brisbane
  'BKKDPS': 2940, // Bangkok to Bali
  'BKKGUM': 4215, // Bangkok to Guam
  'BKKHKG': 1700, // Bangkok to Hong Kong
  'BKKICN': 3735, // Bangkok to Seoul
  'BKKIST': 7570, // Bangkok to Istanbul
  'BKKMNL': 2180, // Bangkok to Manila
  
  // Nordic Routes
  'CPHARN': 520, // Copenhagen to Stockholm
  'CPHBLL': 220, // Copenhagen to Billund
  'CPHDXB': 4670, // Copenhagen to Dubai
  'CPHFRA': 670, // Copenhagen to Frankfurt
  'CPHIST': 2000, // Copenhagen to Istanbul
  'CPHLHR': 955, // Copenhagen to London
  'CPHORD': 6650, // Copenhagen to Chicago
  'CPHWAW': 665, // Copenhagen to Warsaw
  'CPHYYZ': 6000, // Copenhagen to Toronto
  'CPHYUL': 5500, // Copenhagen to Montreal
  'CPHYVR': 7800, // Copenhagen to Vancouver
  'CPHDFW': 7700, // Copenhagen to Dallas
  'CPHSFO': 8800, // Copenhagen to San Francisco
  'CPHMIA': 7300, // Copenhagen to Miami
  'CPHBOS': 5500, // Copenhagen to Boston
  'CPHSEA': 7900, // Copenhagen to Seattle
  
  // European Islands & Vacation Destinations
  'LHRFNC': 2480, // London to Funchal (Madeira)
  'LHRPMI': 1350, // London to Palma de Mallorca
  'LHRTFS': 2950, // London to Tenerife South
  'LHRLPA': 2970, // London to Gran Canaria
  'LHRACE': 2750, // London to Lanzarote
  'LHRFUE': 2840, // London to Fuerteventura
  'LHRIBZ': 1425, // London to Ibiza
  'LHRMAH': 1460, // London to Menorca
  'LHRCFU': 2120, // London to Corfu
  'LHRRHO': 2860, // London to Rhodes
  'LHRKGS': 2850, // London to Kos
  'LHRHER': 3170, // London to Heraklion (Crete)
  'LHRCHQ': 3060, // London to Chania (Crete)
  'LHRJTR': 2950, // London to Santorini
  'LHRJMK': 2850, // London to Mykonos
  'LHRALC': 1450, // London to Alicante
  'LHRAGP': 1720, // London to Malaga
  'LHRFAO': 1750, // London to Faro
  'LHROPO': 1230, // London to Porto
  'LHRSPU': 1700, // London to Split
  'LHRDBV': 1880, // London to Dubrovnik (changed from LHRDUB to prevent duplication with Dublin)
  'LHRPUY': 975,  // London to Pula
  'LHROLB': 1460, // London to Olbia (Sardinia)
  'LHRCAG': 1575, // London to Cagliari (Sardinia)
  'LHRPMO': 1915, // London to Palermo (Sicily)
  'LHRCTA': 2080, // London to Catania (Sicily)
  'LHRJSI': 2380, // London to Skiathos
  'LHRZTH': 2040, // London to Zakynthos
  'LHRPVK': 2670, // London to Preveza
  'LHRKVA': 2450, // London to Kavala
  'LHRSVE': 2320, // London to Seville
  'LHRVLC': 1430, // London to Valencia
  'LHRGEO': 1445, // London to Terceira (Azores)
  'LHRPDL': 2350, // London to Ponta Delgada (Azores)
  'LHRHOR': 1550, // London to Horta (Azores)
  'LHRFLW': 2260, // London to Flores (Azores)
  'LHROMS': 2500, // London to Samokov (Bulgaria)
  'LHRVAR': 2450, // London to Varna
  'LHRBOJ': 2380, // London to Bourgas
  
  // Manchester to European Islands & Vacation Destinations
  'MANFNC': 2550, // Manchester to Funchal (Madeira)
  'MANPMI': 1650, // Manchester to Palma de Mallorca
  'MANTFS': 3150, // Manchester to Tenerife South
  'MANLPA': 3220, // Manchester to Gran Canaria
  'MANACE': 2950, // Manchester to Lanzarote
  'MANFUE': 3040, // Manchester to Fuerteventura
  'MANIBZ': 1700, // Manchester to Ibiza
  'MANMAH': 1730, // Manchester to Menorca
  'MANCFU': 2350, // Manchester to Corfu
  'MANRHO': 3080, // Manchester to Rhodes
  'MANKGS': 3070, // Manchester to Kos
  'MANHER': 3380, // Manchester to Heraklion (Crete)
  'MANCHQ': 3270, // Manchester to Chania (Crete)
  'MANJTR': 3180, // Manchester to Santorini
  'MANJMK': 3070, // Manchester to Mykonos
  'MANALC': 1750, // Manchester to Alicante
  'MANAGP': 1980, // Manchester to Malaga
  'MANFAO': 1930, // Manchester to Faro
  
  // Paris to European Islands & Vacation Destinations
  'CDGFNC': 2470, // Paris to Funchal (Madeira)
  'CDGPMI': 1050, // Paris to Palma de Mallorca
  'CDGTFC': 2750, // Paris to Tenerife South (changed key from CDGTFS to CDGTFC to avoid duplication)
  'CDGLPA': 2830, // Paris to Gran Canaria
  'CDGACE': 2525, // Paris to Lanzarote
  'CDGFUE': 2640, // Paris to Fuerteventura
  'CDGIBZ': 1140, // Paris to Ibiza
  'CDGMAH': 1150, // Paris to Menorca
  'CDGCFU': 1785, // Paris to Corfu
  'CDGRHO': 2470, // Paris to Rhodes
  'CDGKGS': 2460, // Paris to Kos
  'CDGHER': 2570, // Paris to Heraklion (Crete)
  'CDGCHQ': 2460, // Paris to Chania (Crete)
  'CDGJTR': 2545, // Paris to Santorini
  'CDGJMK': 2420, // Paris to Mykonos
  'CDGALC': 1275, // Paris to Alicante
  'CDGAGP': 1450, // Paris to Malaga
  'CDGFAO': 1625, // Paris to Faro
  
  // Frankfurt to European Islands & Vacation Destinations
  'FRAPMI': 1350, // Frankfurt to Palma de Mallorca
  'FRATFS': 3420, // Frankfurt to Tenerife South
  'FRALPA': 3500, // Frankfurt to Gran Canaria
  'FRAACE': 3215, // Frankfurt to Lanzarote
  'FRAFUE': 3325, // Frankfurt to Fuerteventura
  'FRAIBZ': 1420, // Frankfurt to Ibiza
  'FRAMAH': 1430, // Frankfurt to Menorca
  'FRACFU': 1450, // Frankfurt to Corfu
  'FRARHO': 2175, // Frankfurt to Rhodes
  'FRAKGS': 2150, // Frankfurt to Kos
  'FRAHER': 2275, // Frankfurt to Heraklion (Crete)
  'FRACHQ': 2165, // Frankfurt to Chania (Crete)
  'FRAJTR': 2270, // Frankfurt to Santorini
  'FRAJMK': 2140, // Frankfurt to Mykonos
  'FRAALC': 1630, // Frankfurt to Alicante
  'FRAAGP': 1875, // Frankfurt to Malaga
  'FRAFAO': 2050, // Frankfurt to Faro
  
  // Amsterdam to European Islands & Vacation Destinations
  'AMSFNC': 2880, // Amsterdam to Funchal (Madeira)
  'AMSPMI': 1570, // Amsterdam to Palma de Mallorca
  'AMSTFS': 3250, // Amsterdam to Tenerife South
  'AMSLPA': 3330, // Amsterdam to Gran Canaria
  'AMSACE': 3040, // Amsterdam to Lanzarote
  'AMSFUE': 3160, // Amsterdam to Fuerteventura
  'AMSIBZ': 1620, // Amsterdam to Ibiza
  'AMSMAH': 1630, // Amsterdam to Menorca
  'AMSCFU': 1875, // Amsterdam to Corfu
  'AMSRHO': 2475, // Amsterdam to Rhodes
  'AMSKGS': 2450, // Amsterdam to Kos
  'AMSHER': 2570, // Amsterdam to Heraklion (Crete)
  'AMSCHQ': 2460, // Amsterdam to Chania (Crete)
  'AMSJTR': 2550, // Amsterdam to Santorini
  'AMSJMK': 2420, // Amsterdam to Mykonos
  'AMSALC': 1750, // Amsterdam to Alicante
  'AMSAGP': 1950, // Amsterdam to Malaga
  'AMSFAO': 1950, // Amsterdam to Faro
  
  // Madrid to European Islands & Vacation Destinations
  'MADFNC': 1050, // Madrid to Funchal (Madeira)
  'MADPMI': 550, // Madrid to Palma de Mallorca
  'MADLPA': 1770, // Madrid to Gran Canaria
  'MADACE': 1600, // Madrid to Lanzarote
  'MADFUE': 1650, // Madrid to Fuerteventura
  'MADIBZ': 475, // Madrid to Ibiza
  'MADMAH': 600, // Madrid to Menorca
  'MADCFU': 2175, // Madrid to Corfu
  'MADRHO': 2850, // Madrid to Rhodes
  'MADKGS': 2780, // Madrid to Kos
  'MADHER': 2970, // Madrid to Heraklion (Crete)
  'MADCHQ': 2860, // Madrid to Chania (Crete)
  'MADJTR': 2925, // Madrid to Santorini
  'MADJMK': 2750, // Madrid to Mykonos
  
  // Rome to European Islands & Vacation Destinations
  'FCOFNC': 2520, // Rome to Funchal (Madeira)
  'FCOPMI': 850, // Rome to Palma de Mallorca
  'FCOTFS': 2850, // Rome to Tenerife South
  'FCOLPA': 2920, // Rome to Gran Canaria
  'FCOACE': 2700, // Rome to Lanzarote
  'FCOFUE': 2775, // Rome to Fuerteventura
  'FCOIBZ': 920, // Rome to Ibiza
  'FCOMAH': 875, // Rome to Menorca
  'FCOCFU': 650, // Rome to Corfu
  'FCORHO': 1305, // Rome to Rhodes
  'FCOKGS': 1310, // Rome to Kos
  'FCOHER': 1395, // Rome to Heraklion (Crete)
  'FCOCHQ': 1285, // Rome to Chania (Crete)
  'FCOJTR': 1340, // Rome to Santorini
  'FCOJMK': 1210, // Rome to Mykonos
  
  // Additional European City Pairs
  'STRKGX': 2255, // Stuttgart to Heringsdorf
  'MUCKRK': 1275, // Munich to Krakow
  'LISHEL': 3750, // Lisbon to Helsinki
  'VNOTNR': 1100, // Vilnius to Tenerife
  'BCNLDZ': 1600, // Barcelona to Lodz
  'DRSAKH': 1975, // Dresden to Kalamata
  'RIGAEY': 3200, // Riga to Edinburgh 
  'DUBTLL': 1970, // Dublin to Tallinn
  'MADWAW': 2275, // Madrid to Warsaw
  'LUXORY': 2350, // Luxembourg to Paris Orly
  'OPOHAM': 1850, // Porto to Hamburg
  'PRAGDZ': 1850, // Prague to Gdansk
  'BRULUS': 1650, // Brussels to Lisbon
  'BUDALG': 1970, // Budapest to Algiers
  'SOFOSL': 1875, // Sofia to Oslo
  'RIXBUD': 1225, // Riga to Budapest
  'ZRHMRS': 645,  // Zurich to Marseille
  'GVASVQ': 1675, // Geneva to Seville
  'VCEIST': 1280, // Venice to Istanbul
  'MIAKED': 2650, // Milan to Edinburgh
  'ATHOTP': 1560, // Athens to Bucharest
  'SKPAMS': 1650, // Skopje to Amsterdam
  'TIASOU': 3050, // Tirana to Southampton
  'LGWMXP': 925,  // London Gatwick to Milan Malpensa
  'BHXMLA': 2175, // Birmingham to Malta
  'BRSMAN': 1050, // Bristol to Manchester
  'NCECPH': 1450, // Nice to Copenhagen
  'LPLPSA': 1750, // Liverpool to Pisa
  'GLATAN': 2200, // Glasgow to Tangier
  'NCETLV': 2680, // Nice to Tel Aviv
  'LYSLJU': 870,  // Lyon to Ljubljana
  'STANAP': 1550, // London Stansted to Naples
  'LGWEFS': 660,  // London Gatwick to Belfast
  'ORYVIE': 1040, // Paris Orly to Vienna
  'NCEEAP': 950,  // Nice to Basel
  'BRELBA': 1475,  // Bremen to Elba
  
  // Additional Intra-UK and Ireland Routes
  'LONSTD': 240, // London to Stansted
  'LONLGW': 45,  // London to Gatwick
  'LONLTN': 60,  // London to Luton
  'LONGLA': 555, // London to Glasgow
  'LONEDI': 535, // London to Edinburgh
  'LONBHX': 163, // London to Birmingham
  'LONMAN': 263, // London to Manchester
  'LONBRS': 190, // London to Bristol
  'LONCWL': 235, // London to Cardiff
  'LONNWI': 158, // London to Norwich
  'LONHUY': 660, // London to Humberside
  'LONNCL': 447, // London to Newcastle
  'LONABZ': 800, // London to Aberdeen
  'LONSOU': 120, // London to Southampton
  'LONEXT': 239, // London to Exeter
  'LONBOH': 775, // London to Bournemouth
  'LONNQY': 431, // London to Newquay
  'LONBFS': 518, // London to Belfast
  'LONBHD': 539, // London to Belfast City
  'LONDUB': 464, // London to Dublin
  'LONSNN': 572, // London to Shannon
  'LONORK': 608, // London to Cork
  'LONKIR': 746, // London to Kerry
  'LONKNK': 654, // London to Knock
  'LONDSN': 660, // London to Donegal
  'DUBORK': 220, // Dublin to Cork
  'DUBSNN': 190, // Dublin to Shannon
  'DUBKNK': 201, // Dublin to Knock
  'DUBGWY': 185, // Dublin to Galway
  
  // Baltic and Scandinavian Holiday Routes
  'AMSGOT': 1070, // Amsterdam to Gothenburg
  'AMSMMA': 1470, // Amsterdam to Malmo
  'AMSBGO': 1085, // Amsterdam to Bergen
  'AMSTVS': 1210, // Amsterdam to Tromso
  'AMSLAP': 1210, // Amsterdam to Lappland (changed key from AMSLPA to AMSLAP to avoid duplication)
  'AMSTLL': 1690, // Amsterdam to Tallinn
  'AMSGDN': 1065, // Amsterdam to Gdansk
  'AMSKUN': 1050, // Amsterdam to Kaunas
  'FRADNZ': 1050, // Frankfurt to Gdansk
  'FRARVN': 1705, // Frankfurt to Rovaniemi (Lapland)
  'FRAOGS': 1380, // Frankfurt to Angelholm
  'LHRWRO': 1450, // London to Wroclaw
  'LHRBLQ': 1435, // London to Bologna
  'LHRFAE': 1080, // London to Faroe Islands
  'LHRYAQ': 830,  // London to Akureyri (Iceland)
  'LHRBGX': 1120, // London to Bergen (using alternative code to avoid duplication)
  'LHRBLX': 975,  // London to Billund (using alternative code to avoid duplication)
  'LHRAES': 1025, // London to Ålesund
  'LHRGRQ': 1580, // London to Gronigen
  'LHRLBA': 1460, // London to Lübeck
  'LHRMMX': 1425, // London to Malmö
  'LHRLUG': 1370, // London to Lugano
  'LHRBCY': 1990, // London to Burgas
  'LHRVBY': 1710, // London to Visby (Gotland)
  'LHRSFT': 1550, // London to Skellefteå
  'LHRLYM': 1105, // London to Lyön
  'LHRBDQ': 1365, // London to Bardufoss
  'LHRBOD': 1775, // London to Bodø
  'LHRMOL': 2050, // London to Molde
  'LHRTRD': 1115, // London to Trondheim
  'LHRSVG': 1090, // London to Stavanger
  'LHRKSU': 1995, // London to Kristiansund
  'LHRKSD': 1490, // London to Karlstad
  'LHRALF': 1330, // London to Alta
  'LHRLKL': 2320, // London to Lakselv
  'LHRKKN': 2260, // London to Kirkenes
  'LHRFDE': 1680, // London to Førde
  'LHRGDV': 2195, // London to Gällivare
  'LHRJVS': 2400, // London to Jyväskylä
  'LHRKKL': 2180, // London to Kukulisvaara
  'LHRHVG': 1115, // London to Honningsvåg
  'LHRSRJ': 2105, // London to Stord
  'LHRKNJ': 2310, // London to Kristiansand
  'LHRGKI': 2640,  // London to Gotland Visby
  
  // Egyptian and Turkish Beach Resorts
  'LHRHGH': 3890, // London to Hurghada
  'LHRSHM': 3980, // London to Sharm El Sheikh
  'LHRASA': 3760, // London to Aswan
  'LHRLXR': 3900, // London to Luxor
  'LHRALY': 1570, // London to Antalya
  'LHRDLM': 2960, // London to Dalaman
  'LHRBJV': 2810, // London to Bodrum
  'LHRADB': 3060, // London to Izmir
  'LHRHTL': 4775, // London to Haikou (Hainan)
  'LHRLCA': 3290, // London to Larnaca (Cyprus)
  'LHRPFO': 3320, // London to Paphos (Cyprus)
  'LHRHKT': 9625, // London to Phuket (Thailand)
  'LHRUSM': 9450, // London to Koh Samui (Thailand)
  'LHRKRB': 9825, // London to Krabi (Thailand)
  'LHRCTG': 8740, // London to Cartagena (Colombia)
  'LHRMGF': 10575, // London to Marsa Alam (Egypt)
  'LHRSSE': 5540, // London to Seychelles
  'LHRCUN': 8145, // London to Cancun
  'LHRMGB': 7485, // London to Montego Bay (Jamaica)
  'LHRAUQ': 7560, // London to Antigua
  'LHRUVA': 7650, // London to St. Lucia
  'LHRNNT': 16850, // London to Nadi (Fiji)
  'LHRPPT': 18690, // London to Papeete (Tahiti)
  'LHRGCM': 8120, // London to Grand Cayman
  'LHRMBJ': 7800, // London to Montserrat
  'LHRRAB': 6620, // London to Rabat
  'LHRAGD': 2290, // London to Agadir
  'LHRHBE': 3565, // London to Alexandria (Borg El Arab)
  'LHRTCP': 3990, // London to Taba
  'LHRMUH': 3450, // London to Mersa Matruh
  
  // Manchester to holiday resorts
  'MANHGH': 4050, // Manchester to Hurghada
  'MANSHM': 4130, // Manchester to Sharm El Sheikh
  'MANALY': 1700, // Manchester to Antalya
  'MANDLM': 3070, // Manchester to Dalaman
  'MANBJV': 2945, // Manchester to Bodrum
  'MANLCA': 3430, // Manchester to Larnaca (Cyprus)
  'MANPFO': 3460, // Manchester to Paphos (Cyprus)
  'MANHKT': 9780, // Manchester to Phuket
  'MANMBJ': 7620, // Manchester to Montego Bay (Jamaica)
  'MANAUQ': 7680, // Manchester to Antigua
  'MANUVA': 7770, // Manchester to St. Lucia
  'MANCUN': 8260, // Manchester to Cancun
  'MANMGF': 10630, // Manchester to Marsa Alam
  'MANLXR': 4060, // Manchester to Luxor
  'MANASW': 3920, // Manchester to Aswan
  'MANHBE': 3725, // Manchester to Alexandria (Borg El Arab)
  'MANTCP': 4150, // Manchester to Taba
  
  // Amsterdam to holiday resorts
  'AMSHGH': 3650, // Amsterdam to Hurghada
  'AMSSHM': 3720, // Amsterdam to Sharm El Sheikh
  'AMSALY': 2390, // Amsterdam to Antalya
  'AMSDLM': 2580, // Amsterdam to Dalaman
  'AMSBJV': 2420, // Amsterdam to Bodrum
  'AMSLCA': 2950, // Amsterdam to Larnaca
  'AMSPFO': 2970, // Amsterdam to Paphos
  'AMSHKT': 9560, // Amsterdam to Phuket
  'AMSUSM': 9390, // Amsterdam to Koh Samui
  'AMSLXR': 3660, // Amsterdam to Luxor
  'AMSASW': 3520, // Amsterdam to Aswan
  'AMSMGF': 3700, // Amsterdam to Marsa Alam
  'AMSHBE': 3325, // Amsterdam to Alexandria (Borg El Arab)
  
  // Paris to holiday resorts
  'CDGHGH': 3675, // Paris to Hurghada
  'CDGSHM': 3760, // Paris to Sharm El Sheikh
  'CDGALY': 2380, // Paris to Antalya
  'CDGDLM': 2650, // Paris to Dalaman
  'CDGBJV': 2510, // Paris to Bodrum
  'CDGLCA': 3130, // Paris to Larnaca
  'CDGPFO': 3160, // Paris to Paphos
  'CDGHKT': 9530, // Paris to Phuket
  'CDGMGB': 7675, // Paris to Montego Bay
  'CDGAUQ': 6860, // Paris to Antigua
  'CDGUVA': 6950, // Paris to St. Lucia
  'CDGLXR': 3730, // Paris to Luxor
  'CDGASW': 3590, // Paris to Aswan
  'CDGMGF': 3775, // Paris to Marsa Alam
  'CDGHBE': 3375, // Paris to Alexandria (Borg El Arab)
  
  // Frankfurt to holiday resorts
  'FRAHGH': 3375, // Frankfurt to Hurghada
  'FRASHM': 3440, // Frankfurt to Sharm El Sheikh
  'FRAALY': 2150, // Frankfurt to Antalya
  'FRADLM': 2190, // Frankfurt to Dalaman
  'FRABJV': 2060, // Frankfurt to Bodrum
  'FRALCA': 2750, // Frankfurt to Larnaca
  'FRAPFO': 2770, // Frankfurt to Paphos
  'FRAHKT': 9160, // Frankfurt to Phuket
  'FRAMBJ': 7930, // Frankfurt to Montego Bay
  'FRAAUQ': 7160, // Frankfurt to Antigua
  'FRAUVA': 7280, // Frankfurt to St. Lucia
  'FRACUN': 8585, // Frankfurt to Cancun
  'FRALXR': 3480, // Frankfurt to Luxor
  'FRAASW': 3340, // Frankfurt to Aswan
  'FRAMGF': 3525, // Frankfurt to Marsa Alam
  'FRAHBE': 3125, // Frankfurt to Alexandria (Borg El Arab)
  
  // Dubai to holiday destinations
  'DXBHGH': 2325, // Dubai to Hurghada
  'DXBSHM': 2270, // Dubai to Sharm El Sheikh
  'DXBLCA': 2025, // Dubai to Larnaca
  'DXBPFO': 2045, // Dubai to Paphos
  'DXBHKT': 4900, // Dubai to Phuket
  'DXBUSM': 4730, // Dubai to Koh Samui
  'DXBKRB': 4825, // Dubai to Krabi
  'DXBCMB': 3650, // Dubai to Colombo (Sri Lanka)
  'DXBGMP': 5450, // Dubai to Gan Island (Maldives)
  'DXBZNE': 3150, // Dubai to Zanzibar
  'DXBMBJ': 12260, // Dubai to Montego Bay
  'DXBAUQ': 11400, // Dubai to Antigua
  'DXBCUN': 13550, // Dubai to Cancun
  'DXBSSE': 3480, // Dubai to Seychelles
  'DXBNUN': 11025, // Dubai to Noumea (New Caledonia)
  'DXBNNT': 12300, // Dubai to Nadi (Fiji)
  'DXBPPT': 15620, // Dubai to Papeete (Tahiti)
  'DXBLXR': 1800, // Dubai to Luxor
  'DXBASW': 1945, // Dubai to Aswan
  'DXBMGF': 1905, // Dubai to Marsa Alam
  'DXBHBE': 2495, // Dubai to Alexandria (Borg El Arab)
  'DXBTCP': 1215, // Dubai to Taba
  
  // Cairo connections
  'CAILHR': 3530, // Cairo to London
  'CAICDG': 3205, // Cairo to Paris
  'CAIFRA': 2896, // Cairo to Frankfurt
  'CAIFCO': 2065, // Cairo to Rome
  'CAIFCOIB': 2065, // Cairo to Rome ibis
  'CAIAMS': 3211, // Cairo to Amsterdam
  'CAIMAD': 3212, // Cairo to Madrid
  'CAIDXB': 2405, // Cairo to Dubai
  'CAIDOH': 2066, // Cairo to Doha
  'CAIATH': 1121, // Cairo to Athens
  'CAIIST': 1227, // Cairo to Istanbul
  'CAIJFK': 9073, // Cairo to New York
  'CAILAX': 12035, // Cairo to Los Angeles
  'CAIPEK': 7840, // Cairo to Beijing
  'CAIZRH': 2582, // Cairo to Zurich
  'CAIVIK': 3211, // Cairo to Reykjavik
  'CAIBRN': 2725, // Cairo to Bern
  'CAIDME': 7250, // Cairo to Moscow
  'CAIHAM': 2980, // Cairo to Hamburg
  'CAIBER': 2630, // Cairo to Berlin
  'CAIJED': 1050, // Cairo to Jeddah
  'CAIMED': 900, // Cairo to Medina
  'CAIADJ': 7750, // Cairo to Amritsar
  'CAIADD': 3210, // Cairo to Addis Ababa
  'CAINBO': 3425, // Cairo to Nairobi
  'CAILAS': 10895, // Cairo to Las Vegas
  'CAIYVR': 10900, // Cairo to Vancouver
  'CAIKWI': 1339, // Cairo to Kuwait
  'CAIMCT': 2880, // Cairo to Muscat
  'CAIMAA': 4675, // Cairo to Chennai
  'CAIDEL': 4200, // Cairo to Delhi
  'CAIBOM': 4000, // Cairo to Mumbai
  'CAICSB': 3380, // Cairo to Casablanca (renamed from CAICMN to avoid duplicate key)
  
  // Additional Egyptian city pairs
  'HRGDXB': 2325, // Hurghada to Dubai
  'HRGJFK': 9640, // Hurghada to New York
  'HRGCDG': 3675, // Hurghada to Paris
  'HRGFRA': 3375, // Hurghada to Frankfurt
  'HRGLHR': 3890, // Hurghada to London
  'HRGAMS': 3650, // Hurghada to Amsterdam
  'HRGCAI': 450, // Hurghada to Cairo
  'HRGLXR': 235, // Hurghada to Luxor
  'HRGSHM': 145, // Hurghada to Sharm El Sheikh
  'HRGASW': 280, // Hurghada to Aswan
  
  'SHMDXB': 2270, // Sharm El Sheikh to Dubai
  'SHMJFK': 9720, // Sharm El Sheikh to New York
  'SHMCDG': 3760, // Sharm El Sheikh to Paris
  'SHMFRA': 3440, // Sharm El Sheikh to Frankfurt
  'SHMLHR': 3980, // Sharm El Sheikh to London
  'SHMAMS': 3720, // Sharm El Sheikh to Amsterdam
  'SHMCAI': 385, // Sharm El Sheikh to Cairo
  'SHMLXR': 345, // Sharm El Sheikh to Luxor
  'SHMASW': 390, // Sharm El Sheikh to Aswan
  
  'LXRDXB': 1800, // Luxor to Dubai
  'LXRJFK': 9470, // Luxor to New York
  'LXRCDG': 3730, // Luxor to Paris
  'LXRFRA': 3480, // Luxor to Frankfurt
  'LXRLHR': 3900, // Luxor to London
  'LXRSHM': 345, // Luxor to Sharm El Sheikh
  'LXRCAI': 505, // Luxor to Cairo
  'LXRASM': 3660, // Luxor to Amsterdam
  
  // Add some regional airport pairs
  'CAIRAK': 3250, // Cairo to Marrakesh
  'CAITUN': 2175, // Cairo to Tunis
  'CAIALG': 2575, // Cairo to Algiers
  'CAIACC': 3785, // Cairo to Accra
  'CAILOS': 3715, // Cairo to Lagos
  'CAIDAR': 3525, // Cairo to Dar es Salaam
  'CAIHRE': 4095, // Cairo to Harare
  'CAIJNB': 5075, // Cairo to Johannesburg
  'CAICPT': 6650, // Cairo to Cape Town
  'CAIBEY': 610, // Cairo to Beirut
  'CAIAMM': 500, // Cairo to Amman
  
  // Additional European routes to Egyptian destinations
  'BCNHGH': 3410, // Barcelona to Hurghada
  'BCNSHM': 3495, // Barcelona to Sharm El Sheikh
  'BCNLXR': 3465, // Barcelona to Luxor
  'BCNCAI': 3080, // Barcelona to Cairo
  
  'CPHCAI': 3120, // Copenhagen to Cairo
  'CPHHGH': 3690, // Copenhagen to Hurghada
  'CPHSHM': 3770, // Copenhagen to Sharm El Sheikh
  
  'MUCAI': 2695, // Munich to Cairo
  'MUHGH': 3165, // Munich to Hurghada
  'MUSHM': 3230, // Munich to Sharm El Sheikh
  
  'VIECAI': 2320, // Vienna to Cairo
  'VIEHRG': 2950, // Vienna to Hurghada
  'VIESHM': 3010, // Vienna to Sharm El Sheikh
  
  'ZRHCAI': 2582, // Zurich to Cairo
  'ZRHHRG': 3110, // Zurich to Hurghada
  'ZRHSHM': 3175, // Zurich to Sharm El Sheikh
  
  'BRUCAI': 3235, // Brussels to Cairo
  'BRUHRG': 3645, // Brussels to Hurghada
  'BRUSHM': 3710, // Brussels to Sharm El Sheikh
  
  'ATHHGH': 1050, // Athens to Hurghada
  'ATHSHM': 985, // Athens to Sharm El Sheikh
  'ATHLXR': 1270, // Athens to Luxor
  'ATHCAI': 1121, // Athens to Cairo
  
  // New African routes
  'CAISEZ': 3980, // Cairo to Seychelles
  'CAIMRU': 5010, // Cairo to Mauritius
  'CAITNR': 5845, // Cairo to Antananarivo
  
  // Europe to Africa routes
  'LHRLOS': 5075, // London to Lagos
  'LHRACC': 5130, // London to Accra
  'LHRALG': 1805, // London to Algiers
  'LHRTUN': 1835, // London to Tunis
  'LHRADD': 5830, // London to Addis Ababa
  'LHRDAR': 7305, // London to Dar es Salaam
  'LHRHRE': 8250, // London to Harare
  'LHRMRS': 9700, // London to Mauritius (alternate key, renamed from LHRMRU to avoid duplication)
  
  'CDGLOS': 4245, // Paris to Lagos
  'CDGACC': 4310, // Paris to Accra
  'CDGALG': 1305, // Paris to Algiers
  'CDGTUN': 1270, // Paris to Tunis
  'CDGADD': 5220, // Paris to Addis Ababa
  'CDGDAR': 6700, // Paris to Dar es Salaam
  'CDGHRE': 7700, // Paris to Harare
  'CDGMRU': 9100, // Paris to Mauritius
  
  'FRAACC': 4910, // Frankfurt to Accra
  'FRALOS': 4860, // Frankfurt to Lagos
  'FRADAR': 6850, // Frankfurt to Dar es Salaam
  'FRAADD': 5050, // Frankfurt to Addis Ababa
  'FRATUN': 1580, // Frankfurt to Tunis
  'FRAALG': 1640, // Frankfurt to Algiers
  
  // Asian connections to Egypt
  'DELHGH': 4625, // Delhi to Hurghada
  'DELSHM': 4590, // Delhi to Sharm El Sheikh
  'DELCAI': 4200, // Delhi to Cairo
  'DELLXR': 4400, // Delhi to Luxor
  
  'BOMCAI': 4000, // Mumbai to Cairo
  'BOMHRG': 4380, // Mumbai to Hurghada
  'BOMSHM': 4345, // Mumbai to Sharm El Sheikh
  
  'PEKHRG': 7640, // Beijing to Hurghada
  'PEKSHM': 7610, // Beijing to Sharm El Sheikh
  'PEKCAI': 7840, // Beijing to Cairo
  
  'CANHGH': 8060, // Guangzhou to Hurghada
  'CANSHM': 8035, // Guangzhou to Sharm El Sheikh
  'CANCAI': 8280, // Guangzhou to Cairo
  
  'SINHGH': 7250, // Singapore to Hurghada
  'SINSHM': 7220, // Singapore to Sharm El Sheikh
  'SINCAI': 8070, // Singapore to Cairo
  
  'BKKCAI': 7380, // Bangkok to Cairo
  'BKKHRG': 7070, // Bangkok to Hurghada
  'BKKSHM': 7045, // Bangkok to Sharm El Sheikh
  
  // Adding additional airports in Europe and Middle East to worldwide routes
  'LISBOM': 8575, // Lisbon to Mumbai
  'LISDEL': 8790, // Lisbon to Delhi
  'LISCAI': 3470, // Lisbon to Cairo
  'LISDXB': 5825, // Lisbon to Dubai
  'LISSIN': 11980, // Lisbon to Singapore
  'LISBKK': 10840, // Lisbon to Bangkok
  
  'PRGLAX': 9790, // Prague to Los Angeles
  'PRGDXB': 4390, // Prague to Dubai
  'PRGCAI': 2600, // Prague to Cairo
  'PRGJFK': 6600, // Prague to New York
  'PRGSIN': 9725, // Prague to Singapore
  'PRGBKK': 8410, // Prague to Bangkok
  
  'WAWCAI': 2525, // Warsaw to Cairo
  'WAWDXB': 4050, // Warsaw to Dubai
  'WAWBKK': 8195, // Warsaw to Bangkok
  'WAWSIN': 9510, // Warsaw to Singapore
  'WAWJFK': 6850, // Warsaw to New York
  'WAWLAX': 9700, // Warsaw to Los Angeles
};

// Fallback distance calculation using Haversine formula and airport coordinates
const airportCoordinates: Record<string, [number, number]> = {
  // Major airports [latitude, longitude]
  'LHR': [51.4700, -0.4543],   // London Heathrow
  'LGW': [51.1537, -0.1821],   // London Gatwick
  'CDG': [49.0097, 2.5479],    // Paris Charles de Gaulle
  'FRA': [50.0379, 8.5622],    // Frankfurt
  'MAD': [40.4983, -3.5676],   // Madrid
  'FCO': [41.8003, 12.2389],   // Rome Fiumicino
  'AMS': [52.3105, 4.7683],    // Amsterdam Schiphol
  'DUB': [53.4264, -6.2499],   // Dublin
  'JFK': [40.6413, -73.7781],  // New York JFK
  'LAX': [33.9416, -118.4085], // Los Angeles
  'DXB': [25.2528, 55.3644],   // Dubai
  'SIN': [1.3644, 103.9915],   // Singapore
  'HKG': [22.3080, 113.9185],  // Hong Kong
  'SYD': [-33.9399, 151.1753], // Sydney
  'NRT': [35.7720, 140.3929],  // Tokyo Narita
  'GRU': [-23.4356, -46.4731], // Sao Paulo
  'IST': [41.2608, 28.7444],   // Istanbul
  'ATH': [37.9364, 23.9445],   // Athens
  'CPH': [55.6180, 12.6508],   // Copenhagen
  'ARN': [59.6498, 17.9237],   // Stockholm
  'OSL': [60.1976, 11.0384],   // Oslo
  'HEL': [60.3183, 24.9497],   // Helsinki
  'PRG': [50.1008, 14.2600],   // Prague
  'VIE': [48.1102, 16.5697],   // Vienna
  'WAW': [52.1672, 20.9679],   // Warsaw
  'BUD': [47.4298, 19.2611],   // Budapest
  'ZRH': [47.4647, 8.5492],    // Zurich
  'GVA': [46.2380, 6.1089],    // Geneva
  'BCN': [41.2974, 2.0833],    // Barcelona
  'LIS': [38.7742, -9.1342],   // Lisbon
  'MUC': [48.3537, 11.7860],   // Munich
  'BRU': [50.9014, 4.4844],    // Brussels
  'MAN': [53.3537, -2.2750],   // Manchester
  'EDI': [55.9500, -3.3725],   // Edinburgh
  'TLV': [32.0055, 34.8854],   // Tel Aviv
  'CAI': [30.1219, 31.4056],   // Cairo
  'DOH': [25.2609, 51.6138],   // Doha
  'AUH': [24.4330, 54.6511],   // Abu Dhabi
  'RUH': [24.9578, 46.6989],   // Riyadh
  'YYZ': [43.6772, -79.6306],  // Toronto
  'YVR': [49.1967, -123.1815], // Vancouver
  'MEX': [19.4363, -99.0721],  // Mexico City
  'GIG': [-22.8092, -43.2506], // Rio de Janeiro
  'EZE': [-34.8222, -58.5358], // Buenos Aires
  'JNB': [-26.1367, 28.2411],  // Johannesburg
  'CPT': [-33.9689, 18.6017],  // Cape Town
  'NBO': [-1.3192, 36.9280],   // Nairobi
  'PEK': [40.0799, 116.6031],  // Beijing
  'PVG': [31.1443, 121.8083],  // Shanghai
  'ICN': [37.4602, 126.4407],  // Seoul
  'BKK': [13.6900, 100.7501],  // Bangkok
  'KUL': [2.7456, 101.7099],   // Kuala Lumpur
  'SVO': [55.9736, 37.4125],   // Moscow
  'LED': [59.8003, 30.2625],   // St. Petersburg
  'DEL': [28.5562, 77.1000],   // Delhi
  'BOM': [19.0896, 72.8656],   // Mumbai
  // Adding more Egyptian airports
  'HRG': [27.1783, 33.7994],   // Hurghada 
  'SSH': [27.9773, 34.3946],   // Sharm El Sheikh
  'LXR': [25.6710, 32.7066],   // Luxor
  'ASW': [23.9644, 32.8199],   // Aswan
  'ALY': [31.1839, 29.9489],   // Alexandria (El Nouzha)
  'HBE': [30.9176, 29.6964],   // Alexandria (Borg El Arab)
  'MGF': [25.5569, 34.5836],   // Marsa Alam
  'SPX': [31.3972, 27.0225],   // Sphinx International Airport
  'MUH': [31.3256, 27.2207],   // Mersa Matruh
  'TCP': [29.5877, 34.7781],   // Taba
  // Adding more African airports
  'HRE': [-17.9318, 31.0928],  // Harare
  'LOS': [6.5774, 3.3215],     // Lagos
  'ACC': [5.6052, -0.1670],    // Accra
  'DKR': [14.7397, -17.4902],  // Dakar
  'ADD': [8.9778, 38.7993],    // Addis Ababa
  'TNR': [-18.7969, 47.4788],  // Antananarivo
  'MRU': [-20.4303, 57.6836],  // Mauritius
  'SEZ': [-4.6741, 55.5218],   // Seychelles
  'DAR': [-6.8780, 39.2026],   // Dar es Salaam
  'TUN': [36.8512, 10.2272],   // Tunis
  'ALG': [36.6910, 3.2153],    // Algiers
  'CMN': [33.3675, -7.5900],   // Casablanca
  'RAK': [31.6069, -8.0363],   // Marrakesh
  'LPA': [27.9319, -15.3866],  // Gran Canaria
  'TFS': [28.0445, -16.5725],  // Tenerife
  'FNC': [32.6942, -16.7781],  // Funchal (Madeira)
  // Adding more Middle Eastern airports
  'AMM': [31.7226, 35.9932],   // Amman
  'BEY': [33.8208, 35.4885],   // Beirut
  'BAH': [26.2708, 50.6336],   // Bahrain
  'MCT': [23.5931, 58.2844],   // Muscat
  'KWI': [29.2266, 47.9689],   // Kuwait
  'THR': [35.6892, 51.3134],   // Tehran
  'JED': [21.6795, 39.1564],   // Jeddah
  'MED': [24.5545, 39.7051],   // Medina
  'DMM': [26.4712, 49.7977],   // Dammam
  // Adding more Asian airports
  'MLE': [4.1918, 73.5290],    // Male (Maldives)
  'CMB': [7.1801, 79.8841],    // Colombo
  'BLR': [13.1979, 77.7063],   // Bangalore
  'HYD': [17.2404, 78.4294],   // Hyderabad
  'MAA': [12.9941, 80.1709],   // Chennai
  'CGK': [-6.1255, 106.6560],  // Jakarta
  'DPS': [-8.7480, 115.1675],  // Denpasar (Bali)
  'HAN': [21.2187, 105.8047],  // Hanoi
  'SGN': [10.8188, 106.6520],  // Ho Chi Minh City
  'CAN': [23.3959, 113.3080],  // Guangzhou
  'CTU': [30.5784, 103.9473],  // Chengdu
  'XIY': [34.4471, 108.7516],  // Xi'an
  'HND': [35.5493, 139.7798],  // Tokyo Haneda
  'KIX': [34.4344, 135.2436],  // Osaka
  'TPE': [25.0797, 121.2342],  // Taipei
  'MNL': [14.5086, 121.0198]   // Manila
};

/**
 * Calculate distance between two airports using Haversine formula
 * @param departure Departure airport IATA code
 * @param arrival Arrival airport IATA code
 * @returns Distance in kilometers or undefined if coordinates not found
 */
export function calculateDistance(departure: string, arrival: string): number | undefined {
  // First check if we have this route in our predefined distances
  const routeKey = `${departure}${arrival}`;
  const reverseRouteKey = `${arrival}${departure}`;
  
  if (flightDistances[routeKey]) {
    console.log(`Using predefined distance for ${routeKey}: ${flightDistances[routeKey]}km`);
    return flightDistances[routeKey];
  }
  
  if (flightDistances[reverseRouteKey]) {
    console.log(`Using predefined distance for ${reverseRouteKey}: ${flightDistances[reverseRouteKey]}km`);
    return flightDistances[reverseRouteKey];
  }
  
  // Important routes with known distances that might not be in flightDistances
  const knownRoutes: Record<string, number> = {
    'LGWFNC': 2480, // London Gatwick to Funchal (Madeira)
    'FNCLGW': 2480, // Funchal to London Gatwick
    // Add other important routes here
  };
  
  if (knownRoutes[routeKey]) {
    console.log(`Using known distance for ${routeKey}: ${knownRoutes[routeKey]}km`);
    return knownRoutes[routeKey];
  }
  
  if (knownRoutes[reverseRouteKey]) {
    console.log(`Using known distance for ${reverseRouteKey}: ${knownRoutes[reverseRouteKey]}km`);
    return knownRoutes[reverseRouteKey];
  }
  
  // Otherwise calculate using coordinates if available
  const depCoords = airportCoordinates[departure];
  const arrCoords = airportCoordinates[arrival];
  
  if (!depCoords || !arrCoords) {
    console.warn(`Missing coordinates for ${departure} or ${arrival}, using default distance of 1500km`);
    // Return a default value if coordinates not found
    return 1500; // A reasonable medium-distance default
  }
  
  // Haversine formula calculation
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(arrCoords[0] - depCoords[0]);
  const dLon = toRad(arrCoords[1] - depCoords[1]);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(depCoords[0])) * Math.cos(toRad(arrCoords[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const calculatedDistance = Math.round(R * c); // Round to nearest kilometer
  
  console.log(`Calculated distance from ${departure} to ${arrival}: ${calculatedDistance}km`);
  return calculatedDistance;
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Initialize Supabase client with production configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

// Production Supabase client with enhanced error handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'RefundHero',
      'x-application-version': '1.0.0',
    },
  },
});

// API Configuration
const API_CONFIG = {
  baseUrl: `${supabaseUrl}/functions/v1`,
  retryAttempts: 3,
  timeout: 30000,
  rateLimitWindow: 60000,
  maxCallsPerMinute: 30,
  cacheTTL: {
    flightCheck: 5 * 60 * 1000, // 5 minutes
    claims: 2 * 60 * 1000, // 2 minutes
    claimStatus: 30 * 1000, // 30 seconds
  },
};

// Comprehensive airline code mapping for country detection
const AIRLINE_COUNTRY_MAP: Record<string, string> = {
  // UK Airlines
  'BA': 'GB', 'VS': 'GB', 'BY': 'GB', 'ZB': 'GB', 'LS': 'GB', 'U2': 'GB', 'EZY': 'GB',
  'MT': 'GB', 'BE': 'GB', 'TOM': 'GB', 'TC': 'GB', 'ZE': 'GB', 'EXS': 'GB', 'VIR': 'GB',
  'T3': 'GB', 'LM': 'GB', 'SI': 'GB', 'GR': 'GB', 'W9': 'GB',
  
  // French Airlines
  'AF': 'FR', 'UU': 'FR', 'A5': 'FR', 'SS': 'FR', 'XK': 'FR', 'TO': 'FR',
  'BF': 'FR', 'TX': 'FR', 'ZI': 'FR', '5O': 'FR',
  
  // German Airlines
  'LH': 'DE', 'EW': 'DE', 'DE': 'DE', 'XQ': 'DE', '4U': 'DE', 'AB': 'DE',
  'ST': 'DE', 'HF': 'DE', 'EN': 'DE', 'X3': 'DE',
  
  // Spanish Airlines
  'IB': 'ES', 'I2': 'ES', 'VY': 'ES', 'UX': 'ES', 'NT': 'ES', 'EC': 'ES',
  'YW': 'ES', 'V7': 'ES', 'PM': 'ES', 'EB': 'ES',
  
  // Italian Airlines
  'AZ': 'IT', 'IG': 'IT', 'NO': 'IT', 'BV': 'IT', 'VE': 'IT',
  
  // Dutch Airlines
  'KL': 'NL', 'HV': 'NL', 'WA': 'NL', 'OR': 'NL', 'CD': 'NL',
  
  // Swiss Airlines (part of EEA air transport agreement despite not being EU)
  'LX': 'CH', '2L': 'CH', 'GM': 'CH', 'WK': 'CH',
  
  // Austrian Airlines
  'OS': 'AT', 'VO': 'AT', 'BR': 'AT', 'PE': 'AT', 'HG': 'AT', 'E2': 'AT',
  
  // Belgian Airlines
  'SN': 'BE', 'TB': 'BE', 'TV': 'BE', 'JAF': 'BE', 'KF': 'BE',
  
  // Other EU Airlines - Portugal, Luxembourg, etc.
  'TP': 'PT', 'S4': 'PT', 'SP': 'PT', 'NI': 'PT', 'WH': 'PT',
  'LG': 'LU', // Luxair
  
  // Nordic Airlines
  'SK': 'SE', 'DY': 'NO', 'D8': 'NO', 'DX': 'DK', 'RC': 'FO', 'FI': 'IS',
  'WF': 'NO', 'N0': 'NO', 'AY': 'FI', 'FC': 'FI',
  
  // Irish Airlines
  'FR': 'IE', 'EI': 'IE', 'RE': 'IE', 'WX': 'IE', 'AG': 'IE',
  
  // Eastern European Airlines
  'LO': 'PL', 'OK': 'CZ', 'QS': 'CZ', 'W6': 'HU', 'RO': 'RO', 'FB': 'BG',
  'BT': 'LV', 'OU': 'HR', 'JP': 'SI', '0B': 'SK', 'OV': 'EE', 'B2': 'BY',
  'JU': 'RS', '6Y': 'EE',
  
  // Greek Airlines
  'A3': 'GR', 'OA': 'GR', 'GQ': 'GR'
};

// Enhanced API request handling with caching and metrics
async function makeApiRequest<T>(
  endpoint: string,
  params: Record<string, string>,
  options: {
    cache?: boolean;
    ttl?: number;
    retries?: number;
  } = {}
): Promise<T> {
  const cacheKey = `api:${endpoint}:${JSON.stringify(params)}`;
  const startTime = performance.now();

  try {
    if (options.cache) {
      return await cache.get(cacheKey, () => fetchData<T>(endpoint, params), {
        ttl: options.ttl,
      });
    }

    return await fetchData<T>(endpoint, params);
  } catch (error) {
    handleApiError(error);
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    metrics.histogram('api_request_duration', duration, {
      endpoint,
      cached: String(!!options.cache),
    });
  }
}

async function fetchData<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);
  
  // Add all parameters to the URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    logger.debug('Making API request', { endpoint, params });

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      logger.error('API error', data.error);
      throw new Error(data.error.message || 'API error occurred');
    }

    return data;
  } catch (error) {
    logger.error('API request failed', error as Error, { endpoint });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validates flight data for completeness and correctness
 * @param flightData The flight data to validate
 * @returns Validation result with errors if any
 */
function validateFlightData(flightData: FlightData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for required fields
  if (!flightData.flightNumber || flightData.flightNumber.trim() === '') {
    errors.push('Flight number is required');
  } else if (!/^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(flightData.flightNumber)) {
    errors.push('Invalid flight number format (e.g. BA123, LH1234)');
  }
  
  if (!flightData.flightDate || flightData.flightDate.trim() === '') {
    errors.push('Flight date is required');
  } else {
    // Validate date format and ensure it's not in the future
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(flightData.flightDate)) {
      errors.push('Invalid date format (YYYY-MM-DD)');
    } else {
      const flightDate = new Date(flightData.flightDate);
      const today = new Date();
      
      if (isNaN(flightDate.getTime())) {
        errors.push('Invalid date');
      } else if (flightDate > today) {
        errors.push('Flight date cannot be in the future');
      }
    }
  }
  
  // Check airport data
  if (!flightData.departure.iata || flightData.departure.iata.trim() === '') {
    errors.push('Departure airport code is required');
  } else if (!/^[A-Z]{3}$/.test(flightData.departure.iata)) {
    errors.push('Invalid departure airport code (should be 3-letter IATA code)');
  }
  
  if (!flightData.arrival.iata || flightData.arrival.iata.trim() === '') {
    errors.push('Arrival airport code is required');
  } else if (!/^[A-Z]{3}$/.test(flightData.arrival.iata)) {
    errors.push('Invalid arrival airport code (should be 3-letter IATA code)');
  }
  
  // Check country data
  if (!flightData.departure.country || flightData.departure.country.trim() === '') {
    errors.push('Departure country is required');
  }
  
  if (!flightData.arrival.country || flightData.arrival.country.trim() === '') {
    errors.push('Arrival country is required');
  }
  
  // Validate disruption data
  if (!flightData.disruption || !flightData.disruption.type) {
    errors.push('Disruption type is required');
  } else if (!['delay', 'cancellation', 'denied_boarding'].includes(flightData.disruption.type)) {
    errors.push('Invalid disruption type');
  }
  
  // For delays, validate delay duration
  if (flightData.disruption && flightData.disruption.type === 'delay' && 
      (flightData.disruption.delayDuration === undefined || flightData.disruption.delayDuration < 0)) {
    errors.push('Delay duration is required and must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function checkFlightEligibility(flightData: FlightData): Promise<CompensationResult> {
  try {
    // Validate the input data
    const validation = validateFlightData(flightData);
    if (!validation.isValid) {
      throw new Error(`Invalid flight data: ${validation.errors.join(', ')}`);
    }
    
    // Create a basic flight template
    const flightRoute: FlightRoute = {
      flight_date: flightData.flightDate,
      airline: {
        ...flightData.airline,
        country: flightData.airline.country || 'Unknown'
      },
      departure: {
        ...flightData.departure,
        terminal: flightData.departure.terminal || 'Unknown'
      },
      arrival: {
        ...flightData.arrival,
        terminal: flightData.arrival.terminal || 'Unknown'
      },
      flight: {
        iata: flightData.flightNumber,
        number: flightData.flightNumber.substring(2),
        status: 'scheduled'
      },
      departureCountry: flightData.departure.country,
      arrivalCountry: flightData.arrival.country,
      airlineCountry: flightData.airline.country || 'Unknown'
    };

    // Get route key from IATA codes
    const routeKey = `${flightData.departure.iata}${flightData.arrival.iata}`;
    const reverseRouteKey = `${flightData.arrival.iata}${flightData.departure.iata}`;
    
    // Get distance from our database, try both route key orientations
    const distance = flightDistances[routeKey] || 
                     flightDistances[reverseRouteKey] ||
                     calculateDistance(flightData.departure.iata, flightData.arrival.iata) || 
                     1500; // Default to 1500km if all else fails

    // Log the route and distance information for debugging
    console.log(`Flight route: ${routeKey}, Distance: ${distance}km`);
    
    // Pass to eligibility checker
    const result = EligibilityChecker.checkEligibility(
      {
        departureCountry: flightData.departure.country,
        arrivalCountry: flightData.arrival.country,
        airlineCountry: flightData.airline.country || 'Unknown',
        distance
      }, 
      flightData.disruption,
      distance
    );
    
    console.log(`Eligibility check for ${flightData.flightNumber}: ${result.isEligible ? 'Eligible' : 'Not eligible'} (${result.regulation})`);
    
    // Add flightDetails to the result
    return {
      ...result,
      flightDetails: {
        airline: flightData.airline.name,
        flightNumber: flightData.flightNumber,
        departure: {
          airport: flightData.departure.airport,
          iata: flightData.departure.iata,
          terminal: flightData.departure.terminal,
          country: flightData.departure.country
        },
        arrival: {
          airport: flightData.arrival.airport,
          iata: flightData.arrival.iata,
          terminal: flightData.arrival.terminal,
          country: flightData.arrival.country
        }
      }
    };
  } catch (error) {
    console.error('Error checking eligibility:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to check flight eligibility: ${error.message}`);
    }
    throw new Error('Failed to check flight eligibility: Unknown error');
  }
}

// This will process user-provided disruption information to determine eligibility
export function calculateEligibility(
  flightDetails: {
    departure: { country: string, iata: string, airport: string, terminal?: string },
    arrival: { country: string, iata: string, airport: string, terminal?: string },
    airline: { name: string },
    flightNumber: string
  },
  disruption: DisruptionDetails,
  distance: number
): FlightCheckResponse {
  // If distance is not provided, try to look it up from the flightDistances record
  if (!distance || distance <= 0) {
    const departureIata = flightDetails.departure.iata;
    const arrivalIata = flightDetails.arrival.iata;
    const routeKey = `${departureIata}${arrivalIata}`;
    const reverseRouteKey = `${arrivalIata}${departureIata}`;
    
    distance = flightDistances[routeKey] || 
               flightDistances[reverseRouteKey] || 
               calculateDistance(departureIata, arrivalIata) || 
               1500; // Default to 1500km if all else fails
    
    console.log(`Flight route: ${routeKey}, Using calculated distance: ${distance}km`);
  }
  
  // Extract airline's country code from first two letters of flight number
  const airlineCode = flightDetails.flightNumber.substring(0, 2);
  
  // Map specific airline codes to their correct countries
  const AIRLINE_COUNTRY_MAP: Record<string, string> = {
    // UK airlines
    'BA': 'GBR', // British Airways
    'VS': 'GBR', // Virgin Atlantic
    'U2': 'GBR', // EasyJet
    'LS': 'GBR', // Jet2
    'BY': 'GBR', // TUI Airways
    'BE': 'GBR', // Flybe
    'MT': 'GBR', // Thomas Cook Airlines
    'T3': 'GBR', // Eastern Airways
    'LM': 'GBR', // LoganAir
    'W9': 'GBR', // Wizz Air UK
    
    // EU airlines
    'LH': 'DEU', // Lufthansa (Germany)
    'EW': 'DEU', // Eurowings (Germany)
    'AF': 'FRA', // Air France
    'KL': 'NLD', // KLM (Netherlands)
    'IB': 'ESP', // Iberia (Spain)
    'AZ': 'ITA', // ITA Airways (Italy)
    'FR': 'IRL', // Ryanair (Ireland)
    'SK': 'SWE', // SAS (Sweden)
    'OS': 'AUT', // Austrian Airlines (Austria)
    'LX': 'CHE', // Swiss International (Switzerland)
    'TP': 'PRT', // TAP Portugal (Portugal)
    'A3': 'GRC', // Aegean Airlines (Greece)
    'SN': 'BEL', // Brussels Airlines (Belgium)
    
    // Non-EU/UK airlines (for reference)
    'EK': 'UAE', // Emirates
    'QR': 'QAT', // Qatar Airways
    'TK': 'TUR', // Turkish Airlines
    'PC': 'TUR', // Pegasus Airlines
    'EY': 'UAE', // Etihad Airways
    'SQ': 'SGP', // Singapore Airlines
    'CX': 'HKG', // Cathay Pacific
    'AC': 'CAN', // Air Canada
    'AA': 'USA', // American Airlines
    'DL': 'USA'  // Delta Airlines
  };
  
  // Convert country names to ISO codes for consistency
  const COUNTRY_NAME_TO_CODE: Record<string, string> = {
    'United Kingdom': 'GBR',
    'UK': 'GBR',
    'Great Britain': 'GBR',
    'Germany': 'DEU',
    'France': 'FRA',
    'Spain': 'ESP',
    'Italy': 'ITA',
    'Netherlands': 'NLD',
    'Turkey': 'TUR',
    'United Arab Emirates': 'UAE',
    'UAE': 'UAE',
    'United States': 'USA',
    'Canada': 'CAN'
  };
  
  // Determine airline country based on code using the mapping
  const airlineCountry = AIRLINE_COUNTRY_MAP[airlineCode] || 'EU';
  
  // Convert country names to codes
  const departureCountryCode = COUNTRY_NAME_TO_CODE[flightDetails.departure.country] || flightDetails.departure.country;
  const arrivalCountryCode = COUNTRY_NAME_TO_CODE[flightDetails.arrival.country] || flightDetails.arrival.country;
  
  // Setup route information
  const route = {
    departureCountry: departureCountryCode,
    arrivalCountry: arrivalCountryCode,
    airlineCountry: airlineCountry,
    distance: distance
  };
  
  // Calculate eligibility based on user provided disruption
        const eligibility = EligibilityChecker.checkEligibility(route, disruption, distance);

  // Return FlightCheckResponse with both amount and compensation properties
        return {
    ...eligibility,
          compensation: eligibility.amount,
          processingTime: '2-3 weeks',
          flightDetails: {
      airline: flightDetails.airline.name,
      flightNumber: flightDetails.flightNumber,
            departure: {
        airport: flightDetails.departure.airport,
        iata: flightDetails.departure.iata,
        terminal: flightDetails.departure.terminal || '',
        country: flightDetails.departure.country,
            },
            arrival: {
        airport: flightDetails.arrival.airport,
        iata: flightDetails.arrival.iata,
        terminal: flightDetails.arrival.terminal || '',
        country: flightDetails.arrival.country,
            },
          },
        };
}

// Create basic flight template with the minimum info needed
function createBasicFlightTemplate(flightNumber: string, flightDate: string): FlightRoute {
  // Extract airline code from flight number
  const airlineCode = flightNumber.substring(0, 2);
  
  // Get airline info from our mock data
  const mockAirlines = [
    { name: 'British Airways', iata: 'BA', icao: 'BAW', country: 'United Kingdom' },
    { name: 'Lufthansa', iata: 'LH', icao: 'DLH', country: 'Germany' },
    { name: 'Air France', iata: 'AF', icao: 'AFR', country: 'France' },
    { name: 'KLM', iata: 'KL', icao: 'KLM', country: 'Netherlands' },
    { name: 'Emirates', iata: 'EK', icao: 'UAE', country: 'UAE' }
  ];

  const airline = mockAirlines.find((a: Airline) => a.iata === airlineCode) || {
    name: 'Unknown Airline',
    iata: airlineCode,
    country: 'Unknown'
  };

  // Get departure and arrival airports from our mock data
  const mockAirports = [
    { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
    { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
    { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
    { iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' }
  ];

  const departureAirport = mockAirports.find((a: Airport) => a.iata === 'LHR') || {
    iata: 'LHR',
    name: 'London Heathrow',
    city: 'London',
    country: 'United Kingdom'
  };

  const arrivalAirport = mockAirports.find((a: Airport) => a.iata === 'CDG') || {
    iata: 'CDG',
    name: 'Paris Charles de Gaulle',
    city: 'Paris',
    country: 'France'
  };

  // Create a basic flight template with all required properties
  return {
    flight_date: flightDate,
    airline: {
      name: airline.name,
      iata: airline.iata,
      country: airline.country
    },
    departure: {
      airport: departureAirport.name,
      iata: departureAirport.iata,
      terminal: 'T2',
      country: departureAirport.country
    },
    arrival: {
      airport: arrivalAirport.name,
      iata: arrivalAirport.iata,
      terminal: 'T1',
      country: arrivalAirport.country
    },
    flight: {
      iata: flightNumber,
      number: flightNumber.substring(2),
      status: 'scheduled'
    },
    departureCountry: departureAirport.country,
    arrivalCountry: arrivalAirport.country,
    airlineCountry: airline.country
  };
}

// Autocomplete for airlines using AviationStack API
export async function searchAirlines(query: string): Promise<Airline[]> {
  try {
    // Input validation
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    if (query.length < 2) {
      return [];
    }
    
    // Comprehensive airline data
    const airlines = [
      // UK Airlines
      { name: 'British Airways', iata: 'BA', icao: 'BAW', country: 'United Kingdom' },
      { name: 'Virgin Atlantic', iata: 'VS', icao: 'VIR', country: 'United Kingdom' },
      { name: 'EasyJet', iata: 'U2', icao: 'EZY', country: 'United Kingdom' },
      { name: 'Jet2', iata: 'LS', icao: 'EXS', country: 'United Kingdom' },
      { name: 'TUI Airways', iata: 'BY', icao: 'TOM', country: 'United Kingdom' },
      { name: 'Flybe', iata: 'BE', icao: 'BEE', country: 'United Kingdom' },
      { name: 'Thomas Cook Airlines', iata: 'MT', icao: 'TCX', country: 'United Kingdom' },
      { name: 'Eastern Airways', iata: 'T3', icao: 'EZE', country: 'United Kingdom' },
      { name: 'LoganAir', iata: 'LM', icao: 'LOG', country: 'United Kingdom' },
      { name: 'Blue Islands', iata: 'SI', icao: 'BCI', country: 'United Kingdom' },
      { name: 'Aurigny Air Services', iata: 'GR', icao: 'AUR', country: 'United Kingdom' },
      { name: 'Wizz Air UK', iata: 'W9', icao: 'WUK', country: 'United Kingdom' },
      
      // French Airlines
      { name: 'Air France', iata: 'AF', icao: 'AFR', country: 'France' },
      { name: 'Transavia France', iata: 'TO', icao: 'TVF', country: 'France' },
      { name: 'French Bee', iata: 'BF', icao: 'FBU', country: 'France' },
      { name: 'Air Austral', iata: 'UU', icao: 'REU', country: 'France' },
      { name: 'Corsair International', iata: 'SS', icao: 'CRL', country: 'France' },
      { name: 'Air Corsica', iata: 'XK', icao: 'CCM', country: 'France' },
      { name: 'Air Caraibes', iata: 'TX', icao: 'FWI', country: 'France' },
      { name: 'Aigle Azur', iata: 'ZI', icao: 'AAF', country: 'France' },
      { name: 'ASL Airlines France', iata: '5O', icao: 'FPO', country: 'France' },
      { name: 'HOP!', iata: 'A5', icao: 'HOP', country: 'France' },
      
      // German Airlines
      { name: 'Lufthansa', iata: 'LH', icao: 'DLH', country: 'Germany' },
      { name: 'Eurowings', iata: 'EW', icao: 'EWG', country: 'Germany' },
      { name: 'Condor', iata: 'DE', icao: 'CFG', country: 'Germany' },
      { name: 'TUIfly', iata: 'X3', icao: 'TUI', country: 'Germany' },
      { name: 'Germanwings', iata: '4U', icao: 'GWI', country: 'Germany' },
      { name: 'SunExpress Deutschland', iata: 'XQ', icao: 'SXD', country: 'Germany' },
      { name: 'Germania', iata: 'ST', icao: 'GMI', country: 'Germany' },
      { name: 'Hahn Air', iata: 'HR', icao: 'HHN', country: 'Germany' },
      { name: 'Air Berlin', iata: 'AB', icao: 'BER', country: 'Germany' },
      
      // Spanish Airlines
      { name: 'Iberia', iata: 'IB', icao: 'IBE', country: 'Spain' },
      { name: 'Vueling Airlines', iata: 'VY', icao: 'VLG', country: 'Spain' },
      { name: 'Air Europa', iata: 'UX', icao: 'AEA', country: 'Spain' },
      { name: 'Iberia Express', iata: 'I2', icao: 'IBS', country: 'Spain' },
      { name: 'Binter Canarias', iata: 'NT', icao: 'BIC', country: 'Spain' },
      { name: 'Air Nostrum', iata: 'YW', icao: 'ANE', country: 'Spain' },
      { name: 'Volotea', iata: 'V7', icao: 'VOE', country: 'Spain' },
      { name: 'CanaryFly', iata: 'PM', icao: 'CNF', country: 'Spain' },
      { name: 'Wamos Air', iata: 'EB', icao: 'PLM', country: 'Spain' },
      
      // Italian Airlines
      { name: 'ITA Airways', iata: 'AZ', icao: 'ITY', country: 'Italy' }, // New Alitalia
      { name: 'Air Italy', iata: 'IG', icao: 'ISS', country: 'Italy' },
      { name: 'Neos', iata: 'NO', icao: 'NOS', country: 'Italy' },
      { name: 'Blue Panorama Airlines', iata: 'BV', icao: 'BPA', country: 'Italy' },
      { name: 'Air Dolomiti', iata: 'EN', icao: 'DLA', country: 'Italy' },
      
      // Dutch Airlines
      { name: 'KLM', iata: 'KL', icao: 'KLM', country: 'Netherlands' },
      { name: 'Transavia', iata: 'HV', icao: 'TRA', country: 'Netherlands' },
      { name: 'Corendon Dutch Airlines', iata: 'CD', icao: 'CND', country: 'Netherlands' },
      { name: 'TUI fly Netherlands', iata: 'OR', icao: 'TFL', country: 'Netherlands' },
      
      // Nordic Airlines
      { name: 'SAS', iata: 'SK', icao: 'SAS', country: 'Sweden' },
      { name: 'Norwegian', iata: 'DY', icao: 'NAX', country: 'Norway' },
      { name: 'Finnair', iata: 'AY', icao: 'FIN', country: 'Finland' },
      { name: 'Icelandair', iata: 'FI', icao: 'ICE', country: 'Iceland' },
      { name: 'Atlantic Airways', iata: 'RC', icao: 'FLI', country: 'Faroe Islands' },
      { name: 'Widerøe', iata: 'WF', icao: 'WIF', country: 'Norway' },
      { name: 'Norse Atlantic Airways', iata: 'N0', icao: 'NBT', country: 'Norway' },
      
      // Irish Airlines
      { name: 'Ryanair', iata: 'FR', icao: 'RYR', country: 'Ireland' },
      { name: 'Aer Lingus', iata: 'EI', icao: 'EIN', country: 'Ireland' },
      { name: 'CityJet', iata: 'WX', icao: 'BCY', country: 'Ireland' },
      { name: 'ASL Airlines Ireland', iata: 'AG', icao: 'ABR', country: 'Ireland' },
      { name: 'Stobart Air', iata: 'RE', icao: 'STK', country: 'Ireland' },
      
      // Portuguese & Greek Airlines
      { name: 'TAP Portugal', iata: 'TP', icao: 'TAP', country: 'Portugal' },
      { name: 'SATA Air Açores', iata: 'SP', icao: 'SAT', country: 'Portugal' },
      { name: 'Azores Airlines', iata: 'S4', icao: 'RZO', country: 'Portugal' },
      { name: 'Aegean Airlines', iata: 'A3', icao: 'AEE', country: 'Greece' },
      { name: 'Olympic Air', iata: 'OA', icao: 'OAL', country: 'Greece' },
      { name: 'Sky Express', iata: 'GQ', icao: 'SEH', country: 'Greece' },
      
      // Eastern European Airlines
      { name: 'LOT Polish Airlines', iata: 'LO', icao: 'LOT', country: 'Poland' },
      { name: 'Czech Airlines', iata: 'OK', icao: 'CSA', country: 'Czech Republic' },
      { name: 'Wizz Air', iata: 'W6', icao: 'WZZ', country: 'Hungary' },
      { name: 'Tarom', iata: 'RO', icao: 'ROT', country: 'Romania' },
      { name: 'Croatia Airlines', iata: 'OU', icao: 'CTN', country: 'Croatia' },
      { name: 'Bulgaria Air', iata: 'FB', icao: 'LZB', country: 'Bulgaria' },
      { name: 'Air Baltic', iata: 'BT', icao: 'BTI', country: 'Latvia' },
      { name: 'Smartwings', iata: 'QS', icao: 'TVS', country: 'Czech Republic' },
      { name: 'Adria Airways', iata: 'JP', icao: 'ADR', country: 'Slovenia' },
      { name: 'Air Serbia', iata: 'JU', icao: 'ASL', country: 'Serbia' },
      { name: 'Nordica', iata: 'LO', icao: 'EST', country: 'Estonia' }, // Operates under LOT's code
      { name: 'Smartlynx Airlines Estonia', iata: '6Y', icao: 'MYX', country: 'Estonia' },
      
      // Swiss & Austrian Airlines
      { name: 'Swiss International Air Lines', iata: 'LX', icao: 'SWR', country: 'Switzerland' },
      { name: 'Edelweiss Air', iata: 'WK', icao: 'EDW', country: 'Switzerland' },
      { name: 'Austrian Airlines', iata: 'OS', icao: 'AUA', country: 'Austria' },
      { name: 'People\'s', iata: 'PE', icao: 'PEV', country: 'Austria' },
      { name: 'Eurowings Europe', iata: 'E2', icao: 'EWE', country: 'Austria' },
      
      // Belgian & Luxembourgish Airlines
      { name: 'Brussels Airlines', iata: 'SN', icao: 'BEL', country: 'Belgium' },
      { name: 'TUI fly Belgium', iata: 'TB', icao: 'JAF', country: 'Belgium' },
      { name: 'Air Belgium', iata: 'KF', icao: 'ABB', country: 'Belgium' },
      { name: 'Luxair', iata: 'LG', icao: 'LGL', country: 'Luxembourg' },
      
      // Non-EU Airlines (for reference)
      { name: 'Emirates', iata: 'EK', icao: 'UAE', country: 'UAE' },
      { name: 'Qatar Airways', iata: 'QR', icao: 'QTR', country: 'Qatar' },
      { name: 'Turkish Airlines', iata: 'TK', icao: 'THY', country: 'Turkey' },
      { name: 'Pegasus Airlines', iata: 'PC', icao: 'PGT', country: 'Turkey' },
      { name: 'SunExpress', iata: 'XQ', icao: 'SXS', country: 'Turkey' },
      { name: 'AnadoluJet', iata: 'TK', icao: 'AJA', country: 'Turkey' }, // Operated by Turkish Airlines
      { name: 'Etihad Airways', iata: 'EY', icao: 'ETD', country: 'UAE' },
      { name: 'flydubai', iata: 'FZ', icao: 'FDB', country: 'UAE' },
      { name: 'Air Arabia', iata: 'G9', icao: 'ABY', country: 'UAE' },
      { name: 'Saudia', iata: 'SV', icao: 'SVA', country: 'Saudi Arabia' },
      { name: 'Flynas', iata: 'XY', icao: 'KNE', country: 'Saudi Arabia' },
      { name: 'Gulf Air', iata: 'GF', icao: 'GFA', country: 'Bahrain' },
      { name: 'Oman Air', iata: 'WY', icao: 'OMA', country: 'Oman' },
      { name: 'Kuwait Airways', iata: 'KU', icao: 'KAC', country: 'Kuwait' },
      { name: 'Royal Jordanian', iata: 'RJ', icao: 'RJA', country: 'Jordan' },
      { name: 'EgyptAir', iata: 'MS', icao: 'MSR', country: 'Egypt' },
      { name: 'Middle East Airlines', iata: 'ME', icao: 'MEA', country: 'Lebanon' },
      { name: 'Pakistan International Airlines', iata: 'PK', icao: 'PIA', country: 'Pakistan' },
      { name: 'Singapore Airlines', iata: 'SQ', icao: 'SIA', country: 'Singapore' },
      { name: 'Scoot', iata: 'TR', icao: 'TGW', country: 'Singapore' },
      { name: 'Cathay Pacific', iata: 'CX', icao: 'CPA', country: 'Hong Kong' },
      { name: 'Cathay Dragon', iata: 'KA', icao: 'HDA', country: 'Hong Kong' },
      { name: 'Hong Kong Airlines', iata: 'HX', icao: 'CRK', country: 'Hong Kong' },
      { name: 'Japan Airlines', iata: 'JL', icao: 'JAL', country: 'Japan' },
      { name: 'All Nippon Airways', iata: 'NH', icao: 'ANA', country: 'Japan' },
      { name: 'Peach Aviation', iata: 'MM', icao: 'APJ', country: 'Japan' },
      { name: 'Korean Air', iata: 'KE', icao: 'KAL', country: 'South Korea' },
      { name: 'Asiana Airlines', iata: 'OZ', icao: 'AAR', country: 'South Korea' },
      { name: 'Jeju Air', iata: '7C', icao: 'JJA', country: 'South Korea' },
      { name: 'Air China', iata: 'CA', icao: 'CCA', country: 'China' },
      { name: 'China Southern Airlines', iata: 'CZ', icao: 'CSN', country: 'China' },
      { name: 'China Eastern Airlines', iata: 'MU', icao: 'CES', country: 'China' },
      { name: 'Hainan Airlines', iata: 'HU', icao: 'CHH', country: 'China' },
      { name: 'Xiamen Airlines', iata: 'MF', icao: 'CXA', country: 'China' },
      { name: 'Shenzhen Airlines', iata: 'ZH', icao: 'CSZ', country: 'China' },
      { name: 'Air India', iata: 'AI', icao: 'AIC', country: 'India' },
      { name: 'IndiGo', iata: '6E', icao: 'IGO', country: 'India' },
      { name: 'SpiceJet', iata: 'SG', icao: 'SEJ', country: 'India' },
      { name: 'Air India Express', iata: 'IX', icao: 'AXB', country: 'India' },
      { name: 'Vistara', iata: 'UK', icao: 'VTI', country: 'India' },
      { name: 'Garuda Indonesia', iata: 'GA', icao: 'GIA', country: 'Indonesia' },
      { name: 'Lion Air', iata: 'JT', icao: 'LNI', country: 'Indonesia' },
      { name: 'Thai Airways', iata: 'TG', icao: 'THA', country: 'Thailand' },
      { name: 'Bangkok Airways', iata: 'PG', icao: 'BKP', country: 'Thailand' },
      { name: 'Thai AirAsia', iata: 'FD', icao: 'AIQ', country: 'Thailand' },
      { name: 'Vietnam Airlines', iata: 'VN', icao: 'HVN', country: 'Vietnam' },
      { name: 'VietJet Air', iata: 'VJ', icao: 'VJC', country: 'Vietnam' },
      { name: 'Bamboo Airways', iata: 'QH', icao: 'BAV', country: 'Vietnam' },
      { name: 'Malaysia Airlines', iata: 'MH', icao: 'MAS', country: 'Malaysia' },
      { name: 'AirAsia', iata: 'AK', icao: 'AXM', country: 'Malaysia' },
      { name: 'Philippines Airlines', iata: 'PR', icao: 'PAL', country: 'Philippines' },
      { name: 'Cebu Pacific', iata: '5J', icao: 'CEB', country: 'Philippines' },
      { name: 'Qantas', iata: 'QF', icao: 'QFA', country: 'Australia' },
      { name: 'Jetstar Airways', iata: 'JQ', icao: 'JST', country: 'Australia' },
      { name: 'Virgin Australia', iata: 'VA', icao: 'VOZ', country: 'Australia' },
      { name: 'Air New Zealand', iata: 'NZ', icao: 'ANZ', country: 'New Zealand' },
      { name: 'Fiji Airways', iata: 'FJ', icao: 'FJI', country: 'Fiji' },
      { name: 'Air Tahiti Nui', iata: 'TN', icao: 'THT', country: 'French Polynesia' },
      { name: 'Air Canada', iata: 'AC', icao: 'ACA', country: 'Canada' },
      { name: 'WestJet', iata: 'WS', icao: 'WJA', country: 'Canada' },
      { name: 'Air Transat', iata: 'TS', icao: 'TSC', country: 'Canada' },
      { name: 'Porter Airlines', iata: 'PD', icao: 'POE', country: 'Canada' },
      { name: 'American Airlines', iata: 'AA', icao: 'AAL', country: 'USA' },
      { name: 'Delta Air Lines', iata: 'DL', icao: 'DAL', country: 'USA' },
      { name: 'United Airlines', iata: 'UA', icao: 'UAL', country: 'USA' },
      { name: 'Southwest Airlines', iata: 'WN', icao: 'SWA', country: 'USA' },
      { name: 'JetBlue Airways', iata: 'B6', icao: 'JBU', country: 'USA' },
      { name: 'Alaska Airlines', iata: 'AS', icao: 'ASA', country: 'USA' },
      { name: 'Spirit Airlines', iata: 'NK', icao: 'NKS', country: 'USA' },
      { name: 'Frontier Airlines', iata: 'F9', icao: 'FFT', country: 'USA' },
      { name: 'Hawaiian Airlines', iata: 'HA', icao: 'HAL', country: 'USA' },
      { name: 'Allegiant Air', iata: 'G4', icao: 'AAY', country: 'USA' },
      { name: 'Sun Country Airlines', iata: 'SY', icao: 'SCX', country: 'USA' },
      { name: 'Aeromexico', iata: 'AM', icao: 'AMX', country: 'Mexico' },
      { name: 'LATAM Airlines', iata: 'LA', icao: 'LAN', country: 'Chile' },
      { name: 'Avianca', iata: 'AV', icao: 'AVA', country: 'Colombia' },
      { name: 'Copa Airlines', iata: 'CM', icao: 'CMP', country: 'Panama' },
      { name: 'GOL Linhas Aéreas', iata: 'G3', icao: 'GLO', country: 'Brazil' },
      { name: 'Azul Brazilian Airlines', iata: 'AD', icao: 'AZU', country: 'Brazil' },
      { name: 'Aerolineas Argentinas', iata: 'AR', icao: 'ARG', country: 'Argentina' }
    ];

    // Validate query
    if (!query || query.length < 2) {
      return [];
    }

    const searchQuery = query.toLowerCase().trim();
    // Filter using more sophisticated approach
    return airlines.filter(airline => 
      airline.iata.toLowerCase().includes(searchQuery) ||
      airline.name.toLowerCase().includes(searchQuery) ||
      airline.country.toLowerCase().includes(searchQuery) ||
      airline.icao.toLowerCase().includes(searchQuery)
    ).slice(0, 15); // Limit results to improve performance
  } catch (error) {
    console.error('Error searching airlines:', error);
    return []; // Return empty array instead of throwing to ensure UI doesn't break
  }
}

// Autocomplete for airports using AviationStack API
export async function searchAirports(query: string): Promise<Airport[]> {
  try {
    // Input validation
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    if (query.length < 2) {
      return [];
    }

    // Comprehensive airports list that includes all airports from airportCoordinates
    const airports = [
      // UK Airports
      { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
      { iata: 'LGW', name: 'London Gatwick', city: 'London', country: 'United Kingdom' },
      { iata: 'STN', name: 'London Stansted', city: 'London', country: 'United Kingdom' },
      { iata: 'LTN', name: 'London Luton', city: 'London', country: 'United Kingdom' },
      { iata: 'LCY', name: 'London City', city: 'London', country: 'United Kingdom' },
      { iata: 'MAN', name: 'Manchester', city: 'Manchester', country: 'United Kingdom' },
      { iata: 'BHX', name: 'Birmingham', city: 'Birmingham', country: 'United Kingdom' },
      { iata: 'EDI', name: 'Edinburgh', city: 'Edinburgh', country: 'United Kingdom' },
      { iata: 'GLA', name: 'Glasgow', city: 'Glasgow', country: 'United Kingdom' },
      { iata: 'BRS', name: 'Bristol', city: 'Bristol', country: 'United Kingdom' },
      { iata: 'NCL', name: 'Newcastle', city: 'Newcastle', country: 'United Kingdom' },
      { iata: 'LPL', name: 'Liverpool', city: 'Liverpool', country: 'United Kingdom' },
      { iata: 'BFS', name: 'Belfast International', city: 'Belfast', country: 'United Kingdom' },
      { iata: 'BHD', name: 'Belfast City', city: 'Belfast', country: 'United Kingdom' },
      { iata: 'ABZ', name: 'Aberdeen', city: 'Aberdeen', country: 'United Kingdom' },
      { iata: 'SOU', name: 'Southampton', city: 'Southampton', country: 'United Kingdom' },
      { iata: 'EMA', name: 'East Midlands', city: 'Nottingham', country: 'United Kingdom' },
      { iata: 'CWL', name: 'Cardiff', city: 'Cardiff', country: 'United Kingdom' },
      { iata: 'NQY', name: 'Newquay', city: 'Newquay', country: 'United Kingdom' },
      { iata: 'EXT', name: 'Exeter', city: 'Exeter', country: 'United Kingdom' },

      // EU Airports
      { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
      { iata: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France' },
      { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
      { iata: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany' },
      { iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
      { iata: 'MAD', name: 'Madrid Barajas', city: 'Madrid', country: 'Spain' },
      { iata: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona', country: 'Spain' },
      { iata: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'Italy' },
      { iata: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy' },
      { iata: 'BRU', name: 'Brussels', city: 'Brussels', country: 'Belgium' },
      { iata: 'ZRH', name: 'Zurich', city: 'Zurich', country: 'Switzerland' },
      { iata: 'GVA', name: 'Geneva', city: 'Geneva', country: 'Switzerland' },
      { iata: 'CPH', name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark' },
      { iata: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden' },
      { iata: 'HEL', name: 'Helsinki Vantaa', city: 'Helsinki', country: 'Finland' },
      { iata: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway' },
      { iata: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland' },
      { iata: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw', country: 'Poland' },
      { iata: 'PRG', name: 'Prague', city: 'Prague', country: 'Czech Republic' },
      { iata: 'BUD', name: 'Budapest', city: 'Budapest', country: 'Hungary' },
      { iata: 'VIE', name: 'Vienna', city: 'Vienna', country: 'Austria' },
      { iata: 'LIS', name: 'Lisbon', city: 'Lisbon', country: 'Portugal' },
      { iata: 'ATH', name: 'Athens', city: 'Athens', country: 'Greece' },
      
      // Middle East Airports
      { iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey' },
      { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
      { iata: 'AUH', name: 'Abu Dhabi', city: 'Abu Dhabi', country: 'UAE' },
      { iata: 'DOH', name: 'Doha Hamad', city: 'Doha', country: 'Qatar' },
      { iata: 'BAH', name: 'Bahrain International', city: 'Manama', country: 'Bahrain' },
      { iata: 'KWI', name: 'Kuwait International', city: 'Kuwait City', country: 'Kuwait' },
      { iata: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia' },
      { iata: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
      { iata: 'MED', name: 'Prince Mohammad Bin Abdulaziz', city: 'Medina', country: 'Saudi Arabia' },
      { iata: 'DMM', name: 'King Fahd International', city: 'Dammam', country: 'Saudi Arabia' },
      { iata: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv', country: 'Israel' },
      { iata: 'AMM', name: 'Queen Alia International', city: 'Amman', country: 'Jordan' },
      { iata: 'BEY', name: 'Beirut Rafic Hariri', city: 'Beirut', country: 'Lebanon' },
      { iata: 'MCT', name: 'Muscat International', city: 'Muscat', country: 'Oman' },
      { iata: 'THR', name: 'Imam Khomeini International', city: 'Tehran', country: 'Iran' },
      
      // Asian Airports
      { iata: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China' },
      { iata: 'PEK', name: 'Beijing Capital', city: 'Beijing', country: 'China' },
      { iata: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'China' },
      { iata: 'CAN', name: 'Guangzhou Baiyun', city: 'Guangzhou', country: 'China' },
      { iata: 'CTU', name: 'Chengdu Shuangliu', city: 'Chengdu', country: 'China' },
      { iata: 'XIY', name: 'Xi\'an Xianyang', city: 'Xi\'an', country: 'China' },
      { iata: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan' },
      { iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan' },
      { iata: 'KIX', name: 'Osaka Kansai', city: 'Osaka', country: 'Japan' },
      { iata: 'ICN', name: 'Seoul Incheon', city: 'Seoul', country: 'South Korea' },
      { iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
      { iata: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
      { iata: 'HKT', name: 'Phuket International', city: 'Phuket', country: 'Thailand' },
      { iata: 'USM', name: 'Samui International', city: 'Koh Samui', country: 'Thailand' },
      { iata: 'KRB', name: 'Krabi International', city: 'Krabi', country: 'Thailand' },
      { iata: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia' },
      { iata: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India' },
      { iata: 'BOM', name: 'Chhatrapati Shivaji International', city: 'Mumbai', country: 'India' },
      { iata: 'BLR', name: 'Kempegowda International', city: 'Bangalore', country: 'India' },
      { iata: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', country: 'India' },
      { iata: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India' },
      { iata: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines' },
      { iata: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia' },
      { iata: 'DPS', name: 'Ngurah Rai International', city: 'Denpasar', country: 'Indonesia' },
      { iata: 'HAN', name: 'Noi Bai International', city: 'Hanoi', country: 'Vietnam' },
      { iata: 'SGN', name: 'Tan Son Nhat International', city: 'Ho Chi Minh City', country: 'Vietnam' },
      { iata: 'TPE', name: 'Taiwan Taoyuan International', city: 'Taipei', country: 'Taiwan' },
      { iata: 'MLE', name: 'Velana International', city: 'Male', country: 'Maldives' },
      { iata: 'CMB', name: 'Bandaranaike International', city: 'Colombo', country: 'Sri Lanka' },
      
      // North American Airports
      { iata: 'JFK', name: 'New York JFK', city: 'New York', country: 'USA' },
      { iata: 'EWR', name: 'Newark Liberty International', city: 'New York', country: 'USA' },
      { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
      { iata: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago', country: 'USA' },
      { iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA' },
      { iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA' },
      { iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' },
      { iata: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'USA' },
      { iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA' },
      { iata: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' },
      { iata: 'YUL', name: 'Montreal-Trudeau', city: 'Montreal', country: 'Canada' },
      { iata: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
      { iata: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico' },
      
      // South American Airports
      { iata: 'GRU', name: 'São Paulo-Guarulhos International', city: 'São Paulo', country: 'Brazil' },
      { iata: 'GIG', name: 'Rio de Janeiro-Galeão International', city: 'Rio de Janeiro', country: 'Brazil' },
      { iata: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina' },
      { iata: 'SCL', name: 'Comodoro Arturo Merino Benítez', city: 'Santiago', country: 'Chile' },
      
      // African Airports
      { iata: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt' },
      { iata: 'HRG', name: 'Hurghada International', city: 'Hurghada', country: 'Egypt' },
      { iata: 'SSH', name: 'Sharm El Sheikh International', city: 'Sharm El Sheikh', country: 'Egypt' },
      { iata: 'LXR', name: 'Luxor International', city: 'Luxor', country: 'Egypt' },
      { iata: 'ASW', name: 'Aswan International', city: 'Aswan', country: 'Egypt' },
      { iata: 'ALY', name: 'Alexandria El Nouzha', city: 'Alexandria', country: 'Egypt' },
      { iata: 'HBE', name: 'Alexandria Borg El Arab', city: 'Alexandria', country: 'Egypt' },
      { iata: 'MGF', name: 'Marsa Alam International', city: 'Marsa Alam', country: 'Egypt' },
      { iata: 'SPX', name: 'Sphinx International', city: 'Giza', country: 'Egypt' },
      { iata: 'MUH', name: 'Mersa Matruh', city: 'Mersa Matruh', country: 'Egypt' },
      { iata: 'TCP', name: 'Taba International', city: 'Taba', country: 'Egypt' },
      { iata: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa' },
      { iata: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa' },
      { iata: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya' },
      { iata: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigeria' },
      { iata: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco' },
      { iata: 'RAK', name: 'Marrakesh Menara', city: 'Marrakesh', country: 'Morocco' },
      { iata: 'TUN', name: 'Tunis Carthage', city: 'Tunis', country: 'Tunisia' },
      { iata: 'ALG', name: 'Houari Boumediene', city: 'Algiers', country: 'Algeria' },
      { iata: 'ACC', name: 'Kotoka International', city: 'Accra', country: 'Ghana' },
      { iata: 'DKR', name: 'Blaise Diagne International', city: 'Dakar', country: 'Senegal' },
      { iata: 'ADD', name: 'Bole International', city: 'Addis Ababa', country: 'Ethiopia' },
      { iata: 'DAR', name: 'Julius Nyerere International', city: 'Dar es Salaam', country: 'Tanzania' },
      { iata: 'HRE', name: 'Robert Gabriel Mugabe', city: 'Harare', country: 'Zimbabwe' },
      { iata: 'SEZ', name: 'Seychelles International', city: 'Victoria', country: 'Seychelles' },
      { iata: 'MRU', name: 'Sir Seewoosagur Ramgoolam', city: 'Port Louis', country: 'Mauritius' },
      { iata: 'TNR', name: 'Ivato International', city: 'Antananarivo', country: 'Madagascar' },
      
      // Europe Holiday Destinations
      { iata: 'PMI', name: 'Palma de Mallorca', city: 'Palma', country: 'Spain' },
      { iata: 'IBZ', name: 'Ibiza', city: 'Ibiza', country: 'Spain' },
      { iata: 'MAH', name: 'Menorca', city: 'Mahon', country: 'Spain' },
      { iata: 'TFS', name: 'Tenerife South', city: 'Tenerife', country: 'Spain' },
      { iata: 'LPA', name: 'Gran Canaria', city: 'Las Palmas', country: 'Spain' },
      { iata: 'ACE', name: 'Lanzarote', city: 'Arrecife', country: 'Spain' },
      { iata: 'FUE', name: 'Fuerteventura', city: 'Puerto del Rosario', country: 'Spain' },
      { iata: 'FNC', name: 'Madeira', city: 'Funchal', country: 'Portugal' },
      { iata: 'FAO', name: 'Faro', city: 'Faro', country: 'Portugal' },
      { iata: 'CFU', name: 'Corfu', city: 'Corfu', country: 'Greece' },
      { iata: 'RHO', name: 'Rhodes', city: 'Rhodes', country: 'Greece' },
      { iata: 'JTR', name: 'Santorini', city: 'Thira', country: 'Greece' },
      { iata: 'JMK', name: 'Mykonos', city: 'Mykonos', country: 'Greece' },
      { iata: 'HER', name: 'Heraklion', city: 'Crete', country: 'Greece' },
      { iata: 'CHQ', name: 'Chania', city: 'Crete', country: 'Greece' },
      { iata: 'KGS', name: 'Kos', city: 'Kos', country: 'Greece' },
      { iata: 'MLA', name: 'Malta International', city: 'Valletta', country: 'Malta' },
      
      // Turkish & Cyprus Holiday Destinations 
      { iata: 'AYT', name: 'Antalya', city: 'Antalya', country: 'Turkey' },
      { iata: 'DLM', name: 'Dalaman', city: 'Dalaman', country: 'Turkey' },
      { iata: 'BJV', name: 'Bodrum Milas', city: 'Bodrum', country: 'Turkey' },
      { iata: 'LCA', name: 'Larnaca International', city: 'Larnaca', country: 'Cyprus' },
      { iata: 'PFO', name: 'Paphos International', city: 'Paphos', country: 'Cyprus' },
      
      // Caribbean/Mexico Destinations
      { iata: 'CUN', name: 'Cancun International', city: 'Cancun', country: 'Mexico' },
      { iata: 'MBJ', name: 'Sangster International', city: 'Montego Bay', country: 'Jamaica' },
      { iata: 'ANU', name: 'V. C. Bird International', city: 'St. John\'s', country: 'Antigua and Barbuda' },
      { iata: 'UVF', name: 'Hewanorra International', city: 'Vieux Fort', country: 'Saint Lucia' },
      
      // Russia Airports
      { iata: 'SVO', name: 'Sheremetyevo International', city: 'Moscow', country: 'Russia' },
      { iata: 'LED', name: 'Pulkovo International', city: 'St. Petersburg', country: 'Russia' }
    ];
    
    const searchQuery = query.toLowerCase().trim();
    return airports.filter(airport => 
      airport.iata.toLowerCase().includes(searchQuery) ||
      airport.name.toLowerCase().includes(searchQuery) ||
      airport.city?.toLowerCase().includes(searchQuery) ||
      airport.country.toLowerCase().includes(searchQuery)
    ).slice(0, 15); // Limit results to improve performance
  } catch (error) {
    console.error('Error searching airports:', error);
    return []; // Return empty array instead of throwing to ensure UI doesn't break
  }
}

export async function getUserClaims(page = 1, limit = 10): Promise<PaginatedResponse<Claim>> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Authentication required');

  const cacheKey = `claims:user:${user.id}:${page}:${limit}`;

  return cache.get(
    cacheKey,
    async () => {
      const { data, error, count } = await supabase
        .from('claims')
        .select('*, claim_documents(*)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return { data, count: count ?? 0, page, limit };
    },
    { ttl: API_CONFIG.cacheTTL.claims }
  );
}

export async function getClaimStatus(claimId: string): Promise<Claim> {
  const cacheKey = `claim:${claimId}`;

  return cache.get(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('*, claim_documents(*)')
        .eq('id', claimId)
        .single();

      if (error) throw error;
      return data;
    },
    { ttl: API_CONFIG.cacheTTL.claimStatus }
  );
}

export function invalidateUserClaims(userId: string): void {
  const cachePattern = `claims:user:${userId}`;
  cache.invalidate(cachePattern);
}

export function invalidateClaimStatus(claimId: string): void {
  cache.invalidate(`claim:${claimId}`);
}

export async function submitClaim(claimData: any) {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('claims')
      .insert([
        {
          flight_number: claimData.flightNumber,
          flight_date: claimData.flightDate,
          passenger_name: claimData.fullName,
          email: claimData.email,
          phone: claimData.phone,
          passport_number: claimData.passportNumber,
          compensation_amount: claimData.compensationAmount,
          status: 'pending',
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    await sendEmail({
      to: claimData.email,
      name: claimData.fullName,
      template: 'claim_submitted',
      data: {
        claimId: data.id,
        flightNumber: data.flight_number,
        flightDate: data.flight_date,
        compensation: data.compensation_amount,
      },
    });

    return data;
  } catch (error) {
    console.error('Claim submission failed:', error);
    throw new Error(getErrorMessage(error));
  }
}

export async function uploadDocument(
  claimId: string,
  file: File,
  type: 'boarding_pass' | 'booking_confirmation' | 'passport'
) {
  try {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${claimId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('claim-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: documentData, error: documentError } = await supabase
      .from('claim_documents')
      .insert([
        {
          claim_id: claimId,
          type,
          file_path: fileName,
        },
      ])
      .select()
      .single();

    if (documentError) throw documentError;
    return documentData;
  } catch (error) {
    console.error('Document upload failed:', error);
    throw new Error(getErrorMessage(error));
  }
}

export async function getAllClaims(
  page = 1,
  limit = 10,
  filters: ClaimFilters = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      throw new Error('Unauthorized access');
    }

    let query = supabase
      .from('claims')
      .select(`
        *,
        claim_documents (
          id,
          type,
          file_path,
          uploaded_at
        )
      `, { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`
        flight_number.ilike.%${filters.search}%,
        passenger_name.ilike.%${filters.search}%,
        email.ilike.%${filters.search}%
      `);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return { data, count, page, limit };
  } catch (error) {
    console.error('Failed to fetch all claims:', error);
    throw new Error(getErrorMessage(error));
  }
}

export async function updateClaimStatus(claimId: string, status: string) {
  try {
    const validStatuses = ['pending', 'in-review', 'approved', 'paid'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (claimError) throw claimError;

    const { error } = await supabase
      .from('claims')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (error) throw error;

    await sendEmail({
      to: claim.email,
      name: claim.passenger_name,
      template: `claim_${status}` as any,
      data: {
        claimId: claim.id,
        flightNumber: claim.flight_number,
        flightDate: claim.flight_date,
        compensation: claim.compensation_amount,
      },
    });
  } catch (error) {
    console.error('Failed to update claim status:', error);
    throw new Error(getErrorMessage(error));
  }
}