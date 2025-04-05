import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, AlertTriangle, Clock, Cloud, PenTool as Tool, Users, Shield, XCircle, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { formatFlightNumber } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { checkFlightEligibility, calculateEligibility, searchAirports, searchAirlines } from '@/lib/api';
import { FlightCheckResults } from './FlightCheckResults';
import toast from 'react-hot-toast';
import type { 
  DisruptionType, 
  DisruptionReason,
  DisruptionDetails,
  CompensationResult,
  FlightData,
  FlightCheckResponse,
  Airline
} from '../lib/types';

// Extended type for our local state that includes the disruption
interface CheckResultState extends CompensationResult {
  compensation: number;
  processingTime: string;
  disruption: DisruptionDetails;
}

interface Airport {
  name: string;
  iata: string;
  city: string;
  country: string;
}

const disruptionReasons = [
  { id: 'technical_issue', label: 'Technical Issue', icon: Tool },
  { id: 'weather', label: 'Bad Weather', icon: Cloud },
  { id: 'air_traffic_control', label: 'Air Traffic Control', icon: Shield },
  { id: 'security', label: 'Security Issue', icon: Shield },
  { id: 'staff_shortage', label: 'Staff Shortage', icon: Users },
  { id: 'strike', label: 'Strike', icon: Users },
  { id: 'other_airline_fault', label: 'Other Airline Fault', icon: AlertTriangle },
  { id: 'other', label: 'Other Reason', icon: XCircle },
];

// Flight distances in kilometers for common routes
const flightDistances = {
  // UK Routes
  'LHRJFK': 5556, // London Heathrow to New York JFK
  'LHRDXB': 5500, // London Heathrow to Dubai
  'LHRHKG': 9630, // London Heathrow to Hong Kong
  'LHRLAX': 8750, // London Heathrow to Los Angeles
  'LHRCDG': 344,  // London Heathrow to Paris Charles de Gaulle
  'LHRFRA': 650,  // London Heathrow to Frankfurt
  'LHRAMS': 357,  // London Heathrow to Amsterdam
  'LHRMAD': 1260, // London Heathrow to Madrid
  'LHRFCO': 1430, // London Heathrow to Rome
  'LHRBCN': 1150, // London Heathrow to Barcelona
  'LHRDUB': 464,  // London Heathrow to Dublin
  'LHREDI': 534,  // London Heathrow to Edinburgh
  'LHRMUC': 950,  // London Heathrow to Munich
  'LHRZRH': 780,  // London Heathrow to Zurich
  'LHRCPH': 960,  // London Heathrow to Copenhagen
  'LHRARN': 1440, // London Heathrow to Stockholm
  'LHRHEL': 1800, // London Heathrow to Helsinki
  'LHRWAW': 1450, // London Heathrow to Warsaw
  'LHRPRG': 1030, // London Heathrow to Prague
  'LHRBUD': 1450, // London Heathrow to Budapest
  'LHRVIE': 1230, // London Heathrow to Vienna
  'LHRBRU': 320,  // London Heathrow to Brussels
  'LHRLIS': 1580, // London Heathrow to Lisbon
  'LHRATH': 2400, // London Heathrow to Athens
  'LHRIST': 2500, // London Heathrow to Istanbul
  'LHRDOH': 5200, // London Heathrow to Doha
  'LHRICN': 8900, // London Heathrow to Seoul
  'LHRNRT': 9600, // London Heathrow to Tokyo
  'LHRSIN': 10800,// London Heathrow to Singapore
  'LHRBKK': 9500, // London Heathrow to Bangkok
  'LHRDEL': 6700, // London Heathrow to Delhi
  'LHRBOM': 7200, // London Heathrow to Mumbai
  'LHRPEK': 8200, // London Heathrow to Beijing
  'LHRPVG': 9200, // London Heathrow to Shanghai
  'LHRMEL': 16900,// London Heathrow to Melbourne
  'LHRSYD': 17000,// London Heathrow to Sydney
  'LHRJNB': 9100, // London Heathrow to Johannesburg
  'LHRCPT': 9700, // London Heathrow to Cape Town
  'LHRYYZ': 5800, // London Heathrow to Toronto
  'LHRYUL': 5300, // London Heathrow to Montreal
  'LHRYVR': 7600, // London Heathrow to Vancouver
  'LHRORD': 6400, // London Heathrow to Chicago
  'LHRDFW': 7500, // London Heathrow to Dallas
  'LHRSFO': 8600, // London Heathrow to San Francisco
  'LHRMIA': 7100, // London Heathrow to Miami
  'LHRBOS': 5300, // London Heathrow to Boston
  'LHRSEA': 7700, // London Heathrow to Seattle
  
  // EU Routes
  'CDGJFK': 5830, // Paris to New York
  'CDGDXB': 5200, // Paris to Dubai
  'CDGHKG': 9600, // Paris to Hong Kong
  'CDGLAX': 9100, // Paris to Los Angeles
  'CDGFRA': 450,  // Paris to Frankfurt
  'CDGAMS': 430,  // Paris to Amsterdam
  'CDGMAD': 1050, // Paris to Madrid
  'CDGFCO': 1100, // Paris to Rome
  'CDGBCN': 850,  // Paris to Barcelona
  'CDGDUB': 780,  // Paris to Dublin
  'CDGMUC': 680,  // Paris to Munich
  'CDGZRH': 480,  // Paris to Zurich
  'CDGCPH': 1020, // Paris to Copenhagen
  'CDGARN': 1540, // Paris to Stockholm
  'CDGHEL': 1900, // Paris to Helsinki
  'CDGWAW': 1360, // Paris to Warsaw
  'CDGPRG': 880,  // Paris to Prague
  'CDGBUD': 1240, // Paris to Budapest
  'CDGVIE': 1030, // Paris to Vienna
  'CDGBRU': 260,  // Paris to Brussels
  'CDGLIS': 1450, // Paris to Lisbon
  'CDGATH': 2100, // Paris to Athens
  'CDGIST': 2250, // Paris to Istanbul
  'CDGDOH': 4900, // Paris to Doha
  'CDGICN': 8900, // Paris to Seoul
  'CDGNRT': 9700, // Paris to Tokyo
  'CDGSIN': 10700,// Paris to Singapore
  'CDGBKK': 9400, // Paris to Bangkok
  'CDGDEL': 6700, // Paris to Delhi
  'CDGBOM': 7200, // Paris to Mumbai
  'CDGPEK': 8200, // Paris to Beijing
  'CDGPVG': 9200, // Paris to Shanghai
  'CDGMEL': 16900,// Paris to Melbourne
  'CDGSYD': 17000,// Paris to Sydney
  'CDGJNB': 9100, // Paris to Johannesburg
  'CDGCPT': 9700, // Paris to Cape Town
  'CDGYYZ': 5800, // Paris to Toronto
  'CDGYUL': 5300, // Paris to Montreal
  'CDGYVR': 7600, // Paris to Vancouver
  'CDGORD': 6400, // Paris to Chicago
  'CDGDFW': 7500, // Paris to Dallas
  'CDGSFO': 8600, // Paris to San Francisco
  'CDGMIA': 7100, // Paris to Miami
  'CDGBOS': 5300, // Paris to Boston
  'CDGSEA': 7700, // Paris to Seattle
  
  // German Routes
  'FRAJFK': 6200, // Frankfurt to New York
  'FRADXB': 4800, // Frankfurt to Dubai
  'FRAHKG': 9200, // Frankfurt to Hong Kong
  'FRALAX': 9300, // Frankfurt to Los Angeles
  'FRAAMS': 350,  // Frankfurt to Amsterdam
  'FRAMAD': 1800, // Frankfurt to Madrid
  'FRAFCO': 1000, // Frankfurt to Rome
  'FRABCN': 1200, // Frankfurt to Barcelona
  'FRADUB': 1050, // Frankfurt to Dublin
  'FRAMUC': 300,  // Frankfurt to Munich
  'FRAZRH': 300,  // Frankfurt to Zurich
  'FRACPH': 760,  // Frankfurt to Copenhagen
  'FRAARN': 1200, // Frankfurt to Stockholm
  'FRAHEL': 1500, // Frankfurt to Helsinki
  'FRAWAW': 900,  // Frankfurt to Warsaw
  'FRAPRG': 450,  // Frankfurt to Prague
  'FRABUD': 800,  // Frankfurt to Budapest
  'FRAVIE': 600,  // Frankfurt to Vienna
  'FRABRU': 350,  // Frankfurt to Brussels
  'FRALIS': 1900, // Frankfurt to Lisbon
  'FRAATH': 1800, // Frankfurt to Athens
  'FRAIST': 2100, // Frankfurt to Istanbul
  'FRADOH': 4500, // Frankfurt to Doha
  'FRAICN': 8500, // Frankfurt to Seoul
  'FRANRT': 9300, // Frankfurt to Tokyo
  'FRASIN': 10300,// Frankfurt to Singapore
  'FRABKK': 9000, // Frankfurt to Bangkok
  'FRADEL': 6500, // Frankfurt to Delhi
  'FRABOM': 7000, // Frankfurt to Mumbai
  'FRAPEK': 8100, // Frankfurt to Beijing
  'FRAPVG': 9100, // Frankfurt to Shanghai
  'FRAMEL': 16800,// Frankfurt to Melbourne
  'FRASYD': 16900,// Frankfurt to Sydney
  'FRAJNB': 9000, // Frankfurt to Johannesburg
  'FRACPT': 9600, // Frankfurt to Cape Town
  'FRAYYZ': 6300, // Frankfurt to Toronto
  'FRAYUL': 5800, // Frankfurt to Montreal
  'FRAYVR': 8100, // Frankfurt to Vancouver
  'FRAORD': 6900, // Frankfurt to Chicago
  'FRADFW': 8000, // Frankfurt to Dallas
  'FRASFO': 9100, // Frankfurt to San Francisco
  'FRAMIA': 7600, // Frankfurt to Miami
  'FRABOS': 5800, // Frankfurt to Boston
  'FRASEA': 8200, // Frankfurt to Seattle
  
  // Spanish Routes
  'MADJFK': 5800, // Madrid to New York
  'MADDXB': 5200, // Madrid to Dubai
  'MADHKG': 11000,// Madrid to Hong Kong
  'MADLAX': 9400, // Madrid to Los Angeles
  'MADBCN': 500,  // Madrid to Barcelona
  'MADFCO': 1300, // Madrid to Rome
  'MADDUB': 1500, // Madrid to Dublin
  'MADMUC': 1600, // Madrid to Munich
  'MADZRH': 1200, // Madrid to Zurich
  'MADCPH': 2200, // Madrid to Copenhagen
  'MADARN': 2500, // Madrid to Stockholm
  'MADHEL': 2900, // Madrid to Helsinki
  'MADWAW': 2200, // Madrid to Warsaw
  'MADPRG': 1800, // Madrid to Prague
  'MADBUD': 2000, // Madrid to Budapest
  'MADVIE': 1900, // Madrid to Vienna
  'MADBRU': 1400, // Madrid to Brussels
  'MADLIS': 500,  // Madrid to Lisbon
  'MADATH': 2300, // Madrid to Athens
  'MADIST': 2200, // Madrid to Istanbul
  'MADDOH': 5000, // Madrid to Doha
  'MADICN': 9500, // Madrid to Seoul
  'MADNRT': 10300,// Madrid to Tokyo
  'MADSIN': 11200,// Madrid to Singapore
  'MADBKK': 9900, // Madrid to Bangkok
  'MADDEL': 7200, // Madrid to Delhi
  'MADBOM': 7700, // Madrid to Mumbai
  'MADPEK': 8800, // Madrid to Beijing
  'MADPVG': 9800, // Madrid to Shanghai
  'MADMEL': 17500,// Madrid to Melbourne
  'MADSYD': 17600,// Madrid to Sydney
  'MADJNB': 9700, // Madrid to Johannesburg
  'MADCPT': 10300,// Madrid to Cape Town
  'MADYYZ': 6100, // Madrid to Toronto
  'MADYUL': 5600, // Madrid to Montreal
  'MADYVR': 7900, // Madrid to Vancouver
  'MADORD': 6700, // Madrid to Chicago
  'MADDFW': 7800, // Madrid to Dallas
  'MADSFO': 8900, // Madrid to San Francisco
  'MADMIA': 7400, // Madrid to Miami
  'MADBOS': 5600, // Madrid to Boston
  'MADSEA': 8000, // Madrid to Seattle
  
  // Italian Routes
  'FCOJFK': 6900, // Rome to New York
  'FCODXB': 4000, // Rome to Dubai
  'FCOHKG': 9200, // Rome to Hong Kong
  'FCOLAX': 10000,// Rome to Los Angeles
  'FCOBCN': 850,  // Rome to Barcelona
  'FCODUB': 1900, // Rome to Dublin
  'FCOMUC': 800,  // Rome to Munich
  'FCOZRH': 700,  // Rome to Zurich
  'FCOCPH': 1600, // Rome to Copenhagen
  'FCOARN': 1900, // Rome to Stockholm
  'FCOHEL': 2200, // Rome to Helsinki
  'FCOWAW': 1300, // Rome to Warsaw
  'FCOPRG': 1000, // Rome to Prague
  'FCOBUD': 800,  // Rome to Budapest
  'FCOVIE': 800,  // Rome to Vienna
  'FCOBRU': 1200, // Rome to Brussels
  'FCOLIS': 1900, // Rome to Lisbon
  'FCOATH': 1000, // Rome to Athens
  'FCOIST': 1300, // Rome to Istanbul
  'FCODOH': 3700, // Rome to Doha
  'FCOICN': 8700, // Rome to Seoul
  'FCONRT': 9500, // Rome to Tokyo
  'FCOSIN': 10500,// Rome to Singapore
  'FCOBKK': 9200, // Rome to Bangkok
  'FCODEL': 6400, // Rome to Delhi
  'FCOBOM': 6900, // Rome to Mumbai
  'FCOPEK': 8000, // Rome to Beijing
  'FCOPVG': 9000, // Rome to Shanghai
  'FCOMEL': 16700,// Rome to Melbourne
  'FCOSYD': 16800,// Rome to Sydney
  'FCOJNB': 8900, // Rome to Johannesburg
  'FCOCPT': 9500, // Rome to Cape Town
  'FCOYYZ': 7000, // Rome to Toronto
  'FCOYUL': 6500, // Rome to Montreal
  'FCOYVR': 8800, // Rome to Vancouver
  'FCOORD': 7600, // Rome to Chicago
  'FCODFW': 8700, // Rome to Dallas
  'FCOSFO': 9800, // Rome to San Francisco
  'FCOMIA': 8300, // Rome to Miami
  'FCOBOS': 6500, // Rome to Boston
  'FCOSEA': 8900, // Rome to Seattle
  
  // Dutch Routes
  'AMSJFK': 5900, // Amsterdam to New York
  'AMSDXB': 5100, // Amsterdam to Dubai
  'AMSHKG': 9200, // Amsterdam to Hong Kong
  'AMSLAX': 8900, // Amsterdam to Los Angeles
  'AMSBCN': 1200, // Amsterdam to Barcelona
  'AMSFCO': 1300, // Amsterdam to Rome
  'AMSDUB': 750,  // Amsterdam to Dublin
  'AMSMUC': 700,  // Amsterdam to Munich
  'AMSZRH': 650,  // Amsterdam to Zurich
  'AMSCPH': 620,  // Amsterdam to Copenhagen
  'AMSARN': 1100, // Amsterdam to Stockholm
  'AMSHEL': 1400, // Amsterdam to Helsinki
  'AMSWAW': 1100, // Amsterdam to Warsaw
  'AMSPRG': 800,  // Amsterdam to Prague
  'AMSBUD': 1200, // Amsterdam to Budapest
  'AMSVIE': 1000, // Amsterdam to Vienna
  'AMSBRU': 170,  // Amsterdam to Brussels
  'AMSLIS': 1900, // Amsterdam to Lisbon
  'AMSATH': 2200, // Amsterdam to Athens
  'AMSIST': 2200, // Amsterdam to Istanbul
  'AMSDOH': 4800, // Amsterdam to Doha
  'AMSICN': 8600, // Amsterdam to Seoul
  'AMSNRT': 9400, // Amsterdam to Tokyo
  'AMSSIN': 10400,// Amsterdam to Singapore
  'AMSBKK': 9100, // Amsterdam to Bangkok
  'AMSDEL': 6600, // Amsterdam to Delhi
  'AMSBOM': 7100, // Amsterdam to Mumbai
  'AMSPEK': 8200, // Amsterdam to Beijing
  'AMSPVG': 9200, // Amsterdam to Shanghai
  'AMSMEL': 16700,// Amsterdam to Melbourne
  'AMSSYD': 16800,// Amsterdam to Sydney
  'AMSJNB': 9000, // Amsterdam to Johannesburg
  'AMSCPT': 9600, // Amsterdam to Cape Town
  'AMSYYZ': 5900, // Amsterdam to Toronto
  'AMSYUL': 5400, // Amsterdam to Montreal
  'AMSYVR': 7700, // Amsterdam to Vancouver
  'AMSORD': 6500, // Amsterdam to Chicago
  'AMSDFW': 7600, // Amsterdam to Dallas
  'AMSSFO': 8700, // Amsterdam to San Francisco
  'AMSMIA': 7200, // Amsterdam to Miami
  'AMSBOS': 5400, // Amsterdam to Boston
  'AMSSEA': 7800, // Amsterdam to Seattle
  
  // Nordic Routes
  'CPHJFK': 6200, // Copenhagen to New York
  'CPHDXB': 5000, // Copenhagen to Dubai
  'CPHHKG': 8500, // Copenhagen to Hong Kong
  'CPHLAX': 8900, // Copenhagen to Los Angeles
  'CPHARN': 520,  // Copenhagen to Stockholm
  'CPHHEL': 900,  // Copenhagen to Helsinki
  'CPHWAW': 700,  // Copenhagen to Warsaw
  'CPHPRG': 600,  // Copenhagen to Prague
  'CPHBUD': 900,  // Copenhagen to Budapest
  'CPHVIE': 900,  // Copenhagen to Vienna
  'CPHBRU': 800,  // Copenhagen to Brussels
  'CPHLIS': 2400, // Copenhagen to Lisbon
  'CPHATH': 2200, // Copenhagen to Athens
  'CPHIST': 2100, // Copenhagen to Istanbul
  'CPHDOH': 4900, // Copenhagen to Doha
  'CPHICN': 8300, // Copenhagen to Seoul
  'CPHNRT': 9100, // Copenhagen to Tokyo
  'CPHSIN': 10100,// Copenhagen to Singapore
  'CPHBKK': 8800, // Copenhagen to Bangkok
  'CPHDEL': 6300, // Copenhagen to Delhi
  'CPHBOM': 6800, // Copenhagen to Mumbai
  'CPHPEK': 7900, // Copenhagen to Beijing
  'CPHPVG': 8900, // Copenhagen to Shanghai
  'CPHMEL': 16600,// Copenhagen to Melbourne
  'CPHSYD': 16700,// Copenhagen to Sydney
  'CPHJNB': 8800, // Copenhagen to Johannesburg
  'CPHCPT': 9400, // Copenhagen to Cape Town
  'CPHYYZ': 6000, // Copenhagen to Toronto
  'CPHYUL': 5500, // Copenhagen to Montreal
  'CPHYVR': 7800, // Copenhagen to Vancouver
  'CPHORD': 6600, // Copenhagen to Chicago
  'CPHDFW': 7700, // Copenhagen to Dallas
  'CPHSFO': 8800, // Copenhagen to San Francisco
  'CPHMIA': 7300, // Copenhagen to Miami
  'CPHBOS': 5500, // Copenhagen to Boston
  'CPHSEA': 7900, // Copenhagen to Seattle
  
  // Middle Eastern Routes
  'DXBJFK': 11000,// Dubai to New York
  'DXBHKG': 5800, // Dubai to Hong Kong
  'DXBLAX': 13400,// Dubai to Los Angeles
  'DXBLHR': 5500, // Dubai to London
  'DXBCDG': 5200, // Dubai to Paris
  'DXBFRA': 4800, // Dubai to Frankfurt
  'DXBMAD': 5200, // Dubai to Madrid
  'DXBFCO': 4000, // Dubai to Rome
  'DXBAMS': 5100, // Dubai to Amsterdam
  'DXBDOH': 380,  // Dubai to Doha
  'DXBICN': 7000, // Dubai to Seoul
  'DXBNRT': 8000, // Dubai to Tokyo
  'DXBSIN': 5800, // Dubai to Singapore
  'DXBBKK': 4600, // Dubai to Bangkok
  'DXBDEL': 2200, // Dubai to Delhi
  'DXBBOM': 1900, // Dubai to Mumbai
  'DXBPEK': 5800, // Dubai to Beijing
  'DXBPVG': 6800, // Dubai to Shanghai
  'DXBMEL': 12000,// Dubai to Melbourne
  'DXBSYD': 12100,// Dubai to Sydney
  'DXBJNB': 6800, // Dubai to Johannesburg
  'DXBCPT': 7400, // Dubai to Cape Town
  'DXBYYZ': 11000,// Dubai to Toronto
  'DXBYUL': 10500,// Dubai to Montreal
  'DXBYVR': 11800,// Dubai to Vancouver
  'DXBORD': 12000,// Dubai to Chicago
  'DXBDFW': 13100,// Dubai to Dallas
  'DXBSFO': 14200,// Dubai to San Francisco
  'DXBMIA': 12700,// Dubai to Miami
  'DXBBOS': 10900,// Dubai to Boston
  'DXBSEA': 13300,// Dubai to Seattle
  
  // Asian Routes
  'HKGJFK': 13000,// Hong Kong to New York
  'HKGLAX': 11600,// Hong Kong to Los Angeles
  'HKGLHR': 9630, // Hong Kong to London
  'HKGCDG': 9600, // Hong Kong to Paris
  'HKGFRA': 9200, // Hong Kong to Frankfurt
  'HKGMAD': 11000,// Hong Kong to Madrid
  'HKGFCO': 9200, // Hong Kong to Rome
  'HKGAMS': 9200, // Hong Kong to Amsterdam
  'HKGDXB': 5800, // Hong Kong to Dubai
  'HKGICN': 2000, // Hong Kong to Seoul
  'HKGNRT': 2900, // Hong Kong to Tokyo
  'HKGSIN': 2600, // Hong Kong to Singapore
  'HKGBKK': 1700, // Hong Kong to Bangkok
  'HKGDEL': 3800, // Hong Kong to Delhi
  'HKGBOM': 4300, // Hong Kong to Mumbai
  'HKGPEK': 2000, // Hong Kong to Beijing
  'HKGPVG': 1200, // Hong Kong to Shanghai
  'HKGMEL': 7400, // Hong Kong to Melbourne
  'HKGSYD': 7500, // Hong Kong to Sydney
  'HKGJNB': 11600,// Hong Kong to Johannesburg
  'HKGCPT': 12200,// Hong Kong to Cape Town
  'HKGYYZ': 12500,// Hong Kong to Toronto
  'HKGYUL': 12000,// Hong Kong to Montreal
  'HKGYVR': 10300,// Hong Kong to Vancouver
  'HKGORD': 12800,// Hong Kong to Chicago
  'HKGDFW': 13900,// Hong Kong to Dallas
  'HKGSFO': 11100,// Hong Kong to San Francisco
  'HKGMIA': 13600,// Hong Kong to Miami
  'HKGBOS': 11800,// Hong Kong to Boston
  'HKGSEA': 10400,// Hong Kong to Seattle
  
  // North American Routes
  'JFKLAX': 3940, // New York to Los Angeles
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
} as const;

export function FlightCheck() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [airlineQuery, setAirlineQuery] = useState('');
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const [airlineResults, setAirlineResults] = useState<Airline[]>([]);
  const [showAirlineResults, setShowAirlineResults] = useState(false);
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [departureQuery, setDepartureQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);
  const [departureResults, setDepartureResults] = useState<Airport[]>([]);
  const [destinationResults, setDestinationResults] = useState<Airport[]>([]);
  const [showDepartureResults, setShowDepartureResults] = useState(false);
  const [showDestinationResults, setShowDestinationResults] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [step, setStep] = useState<'initial' | 'disruption' | 'results'>('initial');
  const [checkResult, setCheckResult] = useState<CheckResultState | null>(null);
  const [disruption, setDisruption] = useState<DisruptionDetails>({
    type: 'delay',
    delayDuration: 0,
    reason: 'technical_issue',
    voluntary: false,
    alternativeFlight: false,
    additionalInfo: '',
    isDomestic: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate date limits
  const maxDate = new Date().toISOString().split('T')[0];
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 6);
  const minDateStr = minDate.toISOString().split('T')[0];

  // Handle airline search
  useEffect(() => {
    const fetchAirlines = async () => {
      if (airlineQuery.length < 2) {
        setAirlineResults([]);
        return;
      }
      
      try {
        const results = await searchAirlines(airlineQuery);
        setAirlineResults(results);
      } catch (error) {
        console.error('Error searching airlines:', error);
      }
    };
    
    const timer = setTimeout(fetchAirlines, 300);
    return () => clearTimeout(timer);
  }, [airlineQuery]);

  // Handle airport search for departure
  useEffect(() => {
    const fetchDepartureAirports = async () => {
      if (departureQuery.length < 2) {
        setDepartureResults([]);
        return;
      }
      
      try {
        const results = await searchAirports(departureQuery);
        setDepartureResults(results);
      } catch (error) {
        console.error('Error searching airports:', error);
      }
    };
    
    const timer = setTimeout(fetchDepartureAirports, 300);
    return () => clearTimeout(timer);
  }, [departureQuery]);

  // Handle airport search for destination
  useEffect(() => {
    const fetchDestinationAirports = async () => {
      if (destinationQuery.length < 2) {
        setDestinationResults([]);
        return;
      }
      
      try {
        const results = await searchAirports(destinationQuery);
        setDestinationResults(results);
      } catch (error) {
        console.error('Error searching airports:', error);
      }
    };
    
    const timer = setTimeout(fetchDestinationAirports, 300);
    return () => clearTimeout(timer);
  }, [destinationQuery]);

  const selectAirline = (airline: Airline) => {
    setSelectedAirline(airline);
    setAirlineQuery(`${airline.name} (${airline.iata})`);
    setShowAirlineResults(false);
  };

  const selectDepartureAirport = (airport: Airport) => {
    setDepartureAirport(airport);
    setDepartureQuery(`${airport.name} (${airport.iata})`);
    setShowDepartureResults(false);
  };

  const selectDestinationAirport = (airport: Airport) => {
    setDestinationAirport(airport);
    setDestinationQuery(`${airport.name} (${airport.iata})`);
    setShowDestinationResults(false);
  };

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);

    if (!selectedAirline) {
      toast.error('Please select an airline');
      setIsChecking(false);
      return;
    }

    if (!flightNumber) {
      toast.error('Please enter a flight number');
      setIsChecking(false);
      return;
    }

    if (!departureAirport || !destinationAirport) {
      toast.error('Please select both departure and destination airports');
      setIsChecking(false);
      return;
    }

    try {
      const fullFlightNumber = `${selectedAirline.iata}${flightNumber}`;
      
      const flightData: FlightData = {
        flightNumber: fullFlightNumber,
        flightDate: flightDate,
        departure: {
          airport: departureAirport.name,
          iata: departureAirport.iata,
          terminal: '',
          country: departureAirport.country
        },
        arrival: {
          airport: destinationAirport.name,
          iata: destinationAirport.iata,
          terminal: '',
          country: destinationAirport.country
        },
        airline: {
          name: selectedAirline.name,
          iata: selectedAirline.iata,
          country: selectedAirline.country
        },
        disruption
      };

      console.log('Flight data being sent:', flightData);
      const result = await checkFlightEligibility(flightData);
      console.log('Eligibility result:', result);
      
      setCheckResult({
        ...result,
        compensation: result.amount,
        processingTime: '2-3 weeks',
        disruption
      });
      
      // Move to disruption details step
      setStep('disruption');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to check flight eligibility');
    } finally {
      setIsChecking(false);
    }
  };

  const handleDisruptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disruption.type === 'delay' && !disruption.delayDuration) {
      toast.error('Please enter the delay duration');
      return;
    }
    if (!disruption.reason) {
      toast.error('Please select a reason for the disruption');
      return;
    }

    if (!checkResult || !checkResult.flightDetails) {
      toast.error('Missing flight details. Please try again.');
      return;
    }

    // Calculate distance based on departure and arrival airports
    const departureIata = checkResult.flightDetails.departure?.iata || '';
    const arrivalIata = checkResult.flightDetails.arrival?.iata || '';
    const routeKey = `${departureIata}${arrivalIata}`;
    const reverseRouteKey = `${arrivalIata}${departureIata}`;
    
    // Try both orientations of the route key, then default to a safe value
    const distance = flightDistances[routeKey as keyof typeof flightDistances] || 
                    flightDistances[reverseRouteKey as keyof typeof flightDistances] || 
                    3600; // Default to a higher safe value to ensure proper compensation
    
    console.log(`Flight route: ${routeKey}, Using distance: ${distance}km for compensation calculation`);
    
    // Now calculate eligibility based on user-provided disruption details
    const updatedResult = calculateEligibility(
      {
        airline: { name: checkResult.flightDetails.airline || '' },
        flightNumber: checkResult.flightDetails.flightNumber || '',
        departure: checkResult.flightDetails.departure || {
          airport: '',
          iata: '',
          country: ''
        },
        arrival: checkResult.flightDetails.arrival || {
          airport: '',
          iata: '',
          country: ''
        }
      }, 
      disruption,
      distance
    );
    
    // Update with disruption details from user input
    setCheckResult({
      ...updatedResult,
      compensation: updatedResult.amount,
      processingTime: '2-3 weeks',
      disruption
    });
    
    // Move to results step
    setStep('results');
  };

  const handleReset = () => {
    setAirlineQuery('');
    setSelectedAirline(null);
    setFlightNumber('');
    setFlightDate('');
    setDepartureQuery('');
    setDestinationQuery('');
    setDepartureAirport(null);
    setDestinationAirport(null);
    setCheckResult(null);
    setStep('initial');
    setDisruption({
      type: 'delay',
      delayDuration: 0,
      reason: 'technical_issue',
      voluntary: false,
      alternativeFlight: false,
      additionalInfo: '',
      isDomestic: false
    });
  };

  const handleContinue = () => {
    if (!checkResult) return;
    
    if (!user) {
      navigate('/login', { 
        state: { from: '/claim' }
      });
    } else {
      navigate('/claim', {
        state: {
          flightNumber: checkResult.flightDetails?.flightNumber || '',
          flightDate,
          compensation: checkResult.compensation,
          disruption: checkResult.disruption,
        }
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'initial' && (
        <motion.div
          key="check"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-lg mx-auto px-4 sm:px-0"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3 shadow-lg">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Check Your Flight
              </h2>
            </div>

            <form onSubmit={handleCheckEligibility} className="space-y-6">
              {/* Airline Selection */}
              <div className="space-y-2 relative">
                <label htmlFor="airline" className="block text-sm font-medium text-slate-700">
                  Airline
                </label>
                <div className="relative">
                  <Input
                    id="airline"
                    type="text"
                    value={airlineQuery}
                    onChange={(e) => {
                      setAirlineQuery(e.target.value);
                      setShowAirlineResults(true);
                      if (!e.target.value) {
                        setSelectedAirline(null);
                      }
                    }}
                    placeholder="Search for an airline"
                    className="h-12 pr-10"
                    required
                    onFocus={() => setShowAirlineResults(true)}
                  />
                  <Search className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
                </div>
                
                {showAirlineResults && airlineResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {airlineResults.map((airline) => (
                        <li
                          key={airline.iata}
                          className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                          onClick={() => selectAirline(airline)}
                        >
                          <div className="font-medium">{airline.name} ({airline.iata})</div>
                          <div className="text-sm text-slate-500">{airline.country}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="flightNumber" className="block text-sm font-medium text-slate-700">
                  Flight Number
                </label>
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-100 px-3 py-2 rounded-lg text-slate-800 font-mono min-w-[60px] text-center">
                    {selectedAirline?.iata || '??'}
                  </div>
                  <Input
                    id="flightNumber"
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter flight number only (e.g., 1234)"
                    className="h-12"
                    required
                    pattern="^\d{1,4}$"
                    title="Please enter a valid flight number (numbers only)"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Enter only the numeric part of your flight number
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="flightDate" className="block text-sm font-medium text-slate-700">
                  Flight Date
                </label>
                <Input
                  id="flightDate"
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="h-12"
                  required
                  min={minDateStr}
                  max={maxDate}
                />
                <p className="text-sm text-slate-500">
                  Claims can be made for flights within the last 6 years
                </p>
              </div>

              {/* Departure Airport Selection */}
              <div className="space-y-2 relative">
                <label htmlFor="departureAirport" className="block text-sm font-medium text-slate-700">
                  Departure Airport
                </label>
                <div className="relative">
                  <Input
                    id="departureAirport"
                    type="text"
                    value={departureQuery}
                    onChange={(e) => {
                      setDepartureQuery(e.target.value);
                      setShowDepartureResults(true);
                      if (!e.target.value) {
                        setDepartureAirport(null);
                      }
                    }}
                    placeholder="Search airport by name or code"
                    className="h-12 pr-10"
                    required
                    onFocus={() => setShowDepartureResults(true)}
                  />
                  <Search className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
                </div>
                
                {showDepartureResults && departureResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {departureResults.map((airport) => (
                        <li
                          key={airport.iata}
                          className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                          onClick={() => selectDepartureAirport(airport)}
                        >
                          <div className="font-medium">{airport.name} ({airport.iata})</div>
                          <div className="text-sm text-slate-500">{airport.city}, {airport.country}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Destination Airport Selection */}
              <div className="space-y-2 relative">
                <label htmlFor="destinationAirport" className="block text-sm font-medium text-slate-700">
                  Destination Airport
                </label>
                <div className="relative">
                  <Input
                    id="destinationAirport"
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => {
                      setDestinationQuery(e.target.value);
                      setShowDestinationResults(true);
                      if (!e.target.value) {
                        setDestinationAirport(null);
                      }
                    }}
                    placeholder="Search airport by name or code"
                    className="h-12 pr-10"
                    required
                    onFocus={() => setShowDestinationResults(true)}
                  />
                  <Search className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
                </div>
                
                {showDestinationResults && destinationResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {destinationResults.map((airport) => (
                        <li
                          key={airport.iata}
                          className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                          onClick={() => selectDestinationAirport(airport)}
                        >
                          <div className="font-medium">{airport.name} ({airport.iata})</div>
                          <div className="text-sm text-slate-500">{airport.city}, {airport.country}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-12"
                disabled={isChecking}
              >
                {isChecking ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                  >
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </motion.div>
                ) : (
                  'Next: Add Flight Details'
                )}
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-600 text-center">
              Get up to €600 in compensation for delayed or cancelled flights.
              <br />
              <span className="text-slate-500">No win, no fee. It's that simple.</span>
            </p>
          </div>
        </motion.div>
      )}

      {step === 'disruption' && (
        <motion.div
          key="disruption"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-lg mx-auto px-4 sm:px-0"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Flight Disruption Details
              </h2>
            </div>

            {checkResult && checkResult.flightDetails && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="font-medium text-slate-700">
                  {checkResult.flightDetails.airline} {checkResult.flightDetails.flightNumber}
                </p>
                <p className="text-sm text-slate-600">
                  {checkResult.flightDetails.departure?.airport || ''} ({checkResult.flightDetails.departure?.iata || ''}) → 
                  {checkResult.flightDetails.arrival?.airport || ''} ({checkResult.flightDetails.arrival?.iata || ''})
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(flightDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}

            <form onSubmit={handleDisruptionSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Type of Disruption
                  </label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={disruption.type === 'delay' ? 'gradient' : 'outline'}
                      onClick={() => setDisruption({ ...disruption, type: 'delay' })}
                      className="flex-1"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Delay
                    </Button>
                    <Button
                      type="button"
                      variant={disruption.type === 'cancellation' ? 'gradient' : 'outline'}
                      onClick={() => setDisruption({ ...disruption, type: 'cancellation' })}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancellation
                    </Button>
                  </div>
                </div>

                {disruption.type === 'delay' && (
                  <div className="space-y-2">
                    <label htmlFor="delayDuration" className="text-sm font-medium text-slate-700">
                      How long was the delay? (hours)
                    </label>
                    <Input
                      id="delayDuration"
                      type="number"
                      min="1"
                      max="72"
                      value={disruption.delayDuration || ''}
                      onChange={(e) => setDisruption({
                        ...disruption,
                        delayDuration: parseInt(e.target.value),
                      })}
                      className="h-12"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    What was the reason?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {disruptionReasons.map(({ id, label, icon: Icon }) => (
                      <Button
                        key={id}
                        type="button"
                        variant={disruption.reason === id ? 'gradient' : 'outline'}
                        onClick={() => setDisruption({ 
                          ...disruption, 
                          reason: id as DisruptionReason 
                        })}
                        className="justify-start h-auto py-3"
                      >
                        <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1"
                >
                  Check Eligibility
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {step === 'results' && checkResult && (
        <FlightCheckResults
          flightNumber={checkResult.flightDetails?.flightNumber || ''}
          flightDate={flightDate}
          checkResult={checkResult as FlightCheckResponse}
          onReset={handleReset}
          onContinue={handleContinue}
        />
      )}
    </AnimatePresence>
  );
}