import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CheckCircle2, AlertTriangle, BanknoteIcon, Plane, ArrowRight, Info, Tag, Clock, AlertCircle } from "lucide-react";
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

  // Format date nicely
  const formattedDate = new Date(flightDate).toLocaleDateString('en-GB', {
    weekday: 'long', // Use full weekday
    day: 'numeric',
    month: 'long', // Use full month
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-0"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-md border border-gray-200/50 overflow-hidden relative">
        <div className="relative">
          <div className="flex flex-col items-center text-center mb-8">
            {isEligible ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-3 mb-3 shadow-lg"
              >
                <CheckCircle2 className="w-7 h-7 text-white" />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3 mb-3 shadow-lg"
              >
                <AlertTriangle className="w-7 h-7 text-white" />
              </motion.div>
            )}
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-2xl font-semibold mb-1 ${isEligible ? 'text-emerald-700' : 'text-orange-700'}`}
            >
              {isEligible ? "You May Be Eligible!" : "Initial Assessment"}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#444] text-sm max-w-xs mx-auto"
            >
              {isEligible
                ? `Based on the details, you could claim under ${regulation}.`
                : `Our initial check suggests this flight might not qualify due to: ${reason}.`}
            </motion.p>
          </div>

          <div className="space-y-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/60"
            >
              <div className="flex items-center mb-2">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-1.5 rounded-lg shadow-sm mr-3">
                  <Plane className="w-4 h-4 text-blue-700" />
                </div>
                <h3 className="font-medium text-[#1D1D1F] uppercase tracking-wide text-xs">Airline</h3>
              </div>
              <p className="text-base font-semibold text-[#1D1D1F]">{airlineName}</p>
              <p className="text-[#6e6e73] text-xs">Flight {displayFlightNumber}</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/60"
            >
              <h3 className="font-medium text-[#1D1D1F] uppercase tracking-wide text-xs mb-3">Route & Date</h3>
              <div className="flex justify-between items-center mb-3">
                <div className="text-left">
                  <div className="font-semibold text-[#1D1D1F] text-base">{departureIata}</div>
                  <div className="text-xs text-[#6e6e73] max-w-[100px] truncate">{departureAirport}</div>
                  <div className="text-xs text-[#86868b]">{departureCountry}</div>
                </div>
                <div className="flex-1 px-3">
                  <div className="border-t border-gray-300 border-dashed relative">
                    <div className="absolute -top-1.5 left-0 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                    <div className="absolute -top-1.5 right-0 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                    <Plane className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#1D1D1F] text-base">{arrivalIata}</div>
                  <div className="text-xs text-[#6e6e73] max-w-[100px] truncate">{arrivalAirport}</div>
                  <div className="text-xs text-[#86868b]">{arrivalCountry}</div>
                </div>
              </div>
              <div className="text-xs text-[#6e6e73] text-center pt-2 border-t border-gray-100">
                {formattedDate}
              </div>
            </motion.div>

            {isEligible ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-emerald-50/80 to-green-100/60 backdrop-blur-sm rounded-xl p-4 mt-4 shadow-sm border border-emerald-200/70"
              >
                <h3 className="font-medium text-emerald-800 uppercase tracking-wide text-xs mb-3">Potential Compensation</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-900 flex items-center"><BanknoteIcon className="w-4 h-4 mr-1.5 opacity-70" />Amount</span>
                    <span className="font-semibold text-emerald-700 text-base">
                      {formatCurrency(validatedCompensation, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-900 flex items-center"><Info className="w-4 h-4 mr-1.5 opacity-70"/>Regulation</span>
                    <span className="font-medium text-[#1D1D1F]">{regulation}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-900 flex items-center"><Clock className="w-4 h-4 mr-1.5 opacity-70"/>Est. Time</span>
                    <span className="font-medium text-[#1D1D1F]">{processingTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-900 flex items-center"><Tag className="w-4 h-4 mr-1.5 opacity-70"/>Reason Code</span>
                    <span className="font-medium text-[#1D1D1F] capitalize">{reason.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-amber-50/80 to-orange-100/60 backdrop-blur-sm rounded-xl p-4 mt-4 shadow-sm border border-amber-200/70 text-orange-900"
              >
                 <h3 className="font-medium uppercase tracking-wide text-xs mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-1.5"/> Note</h3>
                <p className="text-sm mb-2">
                  <strong className="font-medium">Reason Given:</strong> {reason.replace(/_/g, ' ')} 
                </p>
                <p className="text-xs leading-relaxed opacity-90">
                  Even if the initial check suggests ineligibility, you can proceed. Our experts will perform a detailed review.
                </p>
              </motion.div>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3 pt-2"
          >
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="flex-1 rounded-lg h-12 text-base font-medium shadow-sm hover:shadow border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              Back
            </Button>
            <Button
              type="button"
              variant={isEligible ? "gradient" : "outline"}
              onClick={onContinue}
              className={`flex-1 rounded-lg h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
                !isEligible && 'border-blue-500 text-blue-600 hover:bg-blue-50' 
              }`}
            >
              {isEligible ? (
                <><span>Continue Claim</span><ArrowRight className="ml-1.5 w-4 h-4" /></>
              ) : (
                "Proceed Anyway"
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}