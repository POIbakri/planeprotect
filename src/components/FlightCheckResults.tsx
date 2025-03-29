import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, BanknoteIcon, Plane, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FlightCheckResponse } from "@/lib/types";

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
  const { 
    isEligible, 
    compensation, 
    reason, 
    processingTime, 
    regulation,
    flightDetails 
  } = checkResult;

  const currency = regulation === 'UK261' ? 'GBP' : 'EUR';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-0"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100">
        <div className="flex flex-col items-center text-center mb-8">
          {isEligible ? (
            <div className="bg-emerald-50 rounded-full p-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          ) : (
            <div className="bg-amber-50 rounded-full p-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isEligible ? "Good News!" : "Not Eligible"}
          </h2>
          <p className="text-slate-600">
            {isEligible
              ? `You're eligible for compensation under ${regulation}`
              : "Unfortunately, this flight is not eligible for compensation"}
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-slate-50 rounded-xl p-4 sm:p-6 space-y-4">
            {flightDetails && (
              <>
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Plane className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{flightDetails.airline}</p>
                    <p className="font-semibold text-slate-900">{flightDetails.flightNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Departure</p>
                    <p className="font-semibold text-slate-900">
                      {flightDetails.departure.airport}
                    </p>
                    {flightDetails.departure.terminal && (
                      <p className="text-sm text-slate-500">
                        Terminal {flightDetails.departure.terminal}
                      </p>
                    )}
                    <p className="text-sm text-slate-500">
                      {flightDetails.departure.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Arrival</p>
                    <p className="font-semibold text-slate-900">
                      {flightDetails.arrival.airport}
                    </p>
                    {flightDetails.arrival.terminal && (
                      <p className="text-sm text-slate-500">
                        Terminal {flightDetails.arrival.terminal}
                      </p>
                    )}
                    <p className="text-sm text-slate-500">
                      {flightDetails.arrival.country}
                    </p>
                  </div>
                </div>
              </>
            )}

            {isEligible && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Compensation</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(compensation, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Regulation</span>
                  <span className="font-semibold text-slate-900">{regulation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Processing Time</span>
                  <span className="font-semibold text-slate-900">{processingTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Reason</span>
                  <span className="font-semibold text-slate-900">{reason}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {isEligible ? (
            <>
              <Button
                onClick={onContinue}
                variant="gradient"
                className="w-full h-12 text-base font-medium"
              >
                <span>Continue to Claim</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                Check Another Flight
              </Button>
            </>
          ) : (
            <Button
              onClick={onReset}
              variant="gradient"
              className="w-full h-12 text-base font-medium"
            >
              Check Another Flight
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}