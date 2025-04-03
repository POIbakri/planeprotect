import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CheckCircle2, AlertTriangle, BanknoteIcon, Plane, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flightNumber,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            {isEligible ? "Good News!" : "Initial Assessment"}
          </h2>
          <p className="text-slate-600">
            {isEligible
              ? `You're eligible for compensation under ${regulation}`
              : "Our initial assessment suggests this flight may not be eligible for compensation"}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Flight</span>
            <span className="font-semibold text-slate-900">
              {flightDetails.airline} {flightDetails.flightNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Route</span>
            <span className="font-semibold text-slate-900">
              {flightDetails.departure.iata} → {flightDetails.arrival.iata}
            </span>
          </div>

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

          {!isEligible && (
            <div className="bg-amber-50 rounded-lg p-4 text-amber-800">
              <p className="text-sm mb-2">
                <strong>Note:</strong> {reason}
              </p>
              <p className="text-sm">
                If you believe you are eligible, you can still proceed with your claim. 
                Our team will review your case in detail and consider any additional circumstances.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="button"
            variant={isEligible ? "gradient" : "outline"}
            onClick={onContinue}
            className="flex-1"
          >
            {isEligible ? "Continue to Claim" : "Proceed with Claim"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}