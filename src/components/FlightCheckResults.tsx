import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CheckCircle2, AlertTriangle, BanknoteIcon, Plane, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FlightCheckResponse } from "@/lib/types";
import { useEffect, useState } from "react";
import { calculateDistance } from "@/lib/api";

// Define compensation tiers based on distance
const EU_COMPENSATION = {
  SHORT: { distance: 1500, amount: 250 },   // Flights up to 1,500km
  MEDIUM: { distance: 3500, amount: 400 },  // Flights between 1,500-3,500km
  LONG: { amount: 600 },                    // Flights over 3,500km
};

// Compensation amounts in GBP for UK flights
const UK_COMPENSATION = {
  SHORT: { distance: 1500, amount: 220 },   // Flights up to 1,500km
  MEDIUM: { distance: 3500, amount: 350 },  // Flights between 1,500-3,500km
  LONG: { amount: 520 },                    // Flights over 3,500km
};

interface FlightCheckResultsProps {
  flightNumber: string;
  flightDate: string;
  checkResult: FlightCheckResponse;
  onReset: () => void;
  onContinue: () => void;
}

export function FlightCheckResults({
  flightNumber,
  flightDate,
  checkResult,
  onReset,
  onContinue,
}: FlightCheckResultsProps) {
  const [validatedCompensation, setValidatedCompensation] = useState<number>(checkResult.compensation);
  
  // Validate the compensation amount based on flight distance
  useEffect(() => {
    const { regulation, flightDetails } = checkResult;
    
    if (flightDetails && flightDetails.departure && flightDetails.arrival) {
      const depIata = flightDetails.departure.iata;
      const arrIata = flightDetails.arrival.iata;
      
      if (depIata && arrIata) {
        try {
          // Get distance between airports
          const distance = calculateDistance(depIata, arrIata) || 0;
          
          // Calculate the correct compensation based on distance and regulation
          const compensationTiers = regulation === 'UK261' ? UK_COMPENSATION : EU_COMPENSATION;
          let correctAmount = compensationTiers.LONG.amount;
          
          if (distance <= compensationTiers.SHORT.distance) {
            correctAmount = compensationTiers.SHORT.amount;
          } else if (distance <= compensationTiers.MEDIUM.distance) {
            correctAmount = compensationTiers.MEDIUM.amount;
          }
          
          // If there's a discrepancy, update the compensation amount
          if (correctAmount !== checkResult.compensation) {
            console.warn(`Correcting compensation amount from ${checkResult.compensation} to ${correctAmount} based on distance ${distance}km`);
            setValidatedCompensation(correctAmount);
          } else {
            setValidatedCompensation(checkResult.compensation);
          }
        } catch (error) {
          console.error('Error validating compensation:', error);
          // In case of error, use the original compensation amount
          setValidatedCompensation(checkResult.compensation);
        }
      }
    }
  }, [checkResult]);
  
  const { 
    isEligible, 
    reason, 
    processingTime, 
    regulation,
    flightDetails 
  } = checkResult;

  const currency = regulation === 'UK261' ? 'GBP' : 'EUR';

  // Create fallback values for flight details if they're missing
  const airlineName = flightDetails?.airline || 'Unknown airline';
  const displayFlightNumber = flightDetails?.flightNumber || flightNumber;
  const departureIata = flightDetails?.departure?.iata || 'DEP';
  const arrivalIata = flightDetails?.arrival?.iata || 'ARR';
  const departureAirport = flightDetails?.departure?.airport || 'Unknown departure';
  const arrivalAirport = flightDetails?.arrival?.airport || 'Unknown arrival';
  const departureCountry = flightDetails?.departure?.country || '';
  const arrivalCountry = flightDetails?.arrival?.country || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-0"
    >
      <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-lg border border-white/50 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex flex-col items-center text-center mb-8">
            {isEligible ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full p-4 mb-4 shadow-md"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-full p-4 mb-4 shadow-md"
              >
                <AlertTriangle className="w-8 h-8 text-white" />
              </motion.div>
            )}
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-[#1D1D1F] mb-2"
            >
              {isEligible ? "Good News!" : "Initial Assessment"}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#6e6e73]"
            >
              {isEligible
                ? `You're eligible for compensation under ${regulation}`
                : "Our initial assessment suggests this flight may not be eligible for compensation"}
            </motion.p>
          </div>

          <div className="space-y-5 mb-8">
            {/* Airline section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/50 mb-4"
            >
              <div className="flex items-center mb-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-xl shadow-sm mr-3">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-[#1D1D1F] uppercase tracking-wide text-sm">Airline</h3>
              </div>
              <p className="text-lg font-semibold text-[#1D1D1F]">{airlineName}</p>
              <p className="text-[#6e6e73] text-sm">Flight {displayFlightNumber}</p>
            </motion.div>
            
            {/* Route details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/50"
            >
              <h3 className="font-medium text-[#1D1D1F] uppercase tracking-wide text-sm mb-4">Route Details</h3>
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <div className="font-medium text-[#1D1D1F] text-lg">{departureIata}</div>
                  <div className="text-xs text-[#6e6e73]">{departureAirport}</div>
                  <div className="text-xs text-[#86868b]">{departureCountry}</div>
                </div>
                <div className="flex-1 px-4">
                  <div className="border-t-2 border-slate-200 border-dashed relative">
                    <div className="absolute -top-1.5 left-0 w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                    <div className="absolute -top-1.5 right-0 w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                    <Plane className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-[#1D1D1F] text-lg">{arrivalIata}</div>
                  <div className="text-xs text-[#6e6e73]">{arrivalAirport}</div>
                  <div className="text-xs text-[#86868b]">{arrivalCountry}</div>
                </div>
              </div>
              <div className="mt-5 text-sm text-[#6e6e73] text-center">
                {new Date(flightDate).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </motion.div>

            {isEligible && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 backdrop-blur-sm rounded-2xl p-5 mt-4 shadow-sm border border-emerald-100"
              >
                <h3 className="font-medium text-emerald-800 uppercase tracking-wide text-sm mb-4">Compensation Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#1D1D1F]">Amount</span>
                    <span className="font-semibold text-emerald-700 text-lg">
                      {formatCurrency(validatedCompensation, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1D1D1F]">Regulation</span>
                    <span className="font-medium text-[#1D1D1F]">{regulation}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1D1D1F]">Processing Time</span>
                    <span className="font-medium text-[#1D1D1F]">{processingTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1D1D1F]">Reason</span>
                    <span className="font-medium text-[#1D1D1F]">{reason}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {!isEligible && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-amber-50 to-amber-100/70 backdrop-blur-sm rounded-2xl p-5 mt-4 shadow-sm border border-amber-100 text-[#1D1D1F]"
              >
                <p className="text-sm mb-3">
                  <strong className="font-medium">Note:</strong> {reason}
                </p>
                <p className="text-sm leading-relaxed">
                  If you believe you are eligible, you can still proceed with your claim. 
                  Our team will review your case in detail and consider any additional circumstances.
                </p>
              </motion.div>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="flex-1 rounded-xl h-12 shadow-sm hover:shadow transition-all duration-200"
            >
              Back
            </Button>
            <Button
              type="button"
              variant={isEligible ? "gradient" : "outline"}
              onClick={onContinue}
              className="flex-1 rounded-xl h-12 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {isEligible ? (
                <><span>Continue to Claim</span><ArrowRight className="ml-2 w-4 h-4" /></>
              ) : (
                "Proceed with Claim"
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}