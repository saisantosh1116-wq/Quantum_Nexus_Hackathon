
import React, { useState, useCallback } from 'react';
import { UserInput, AIDecision } from './types';
import { getMedicalDecision, mockBookAppointment } from './services/geminiService';
import UserInputForm from './components/UserInputForm';
import DecisionDisplay from './components/DecisionDisplay';
import Disclaimer from './components/Disclaimer';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput>({
    age: '',
    conditions: '',
    allergies: '',
    medications: '',
    situation: '',
  });
  const [aiDecision, setAiDecision] = useState<AIDecision | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<string | null>(null);

  const assessSituation = useCallback(async (input: UserInput) => {
    setIsLoading(true);
    setError(null);
    setAiDecision(null);

    try {
      if (!input.situation.trim()) {
        throw new Error("Current situation description cannot be empty.");
      }
      const decision = await getMedicalDecision(input);
      setAiDecision(decision);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Failed to get assessment. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleInitialAssessment = useCallback(async () => {
    setBookingConfirmation(null); // Reset booking on new assessment
    await assessSituation(userInput);
  }, [userInput, assessSituation]);
  
  const handleReassessment = useCallback(async (answers: string) => {
    const updatedSituation = `
--- Original Situation ---
${userInput.situation}

--- Follow-up Information Provided by User ---
${answers}
    `;

    const updatedUserInput = {
      ...userInput,
      situation: updatedSituation,
    };
    
    setUserInput(updatedUserInput);
    await assessSituation(updatedUserInput);
  }, [userInput, assessSituation]);


  const handleBookAppointment = useCallback(async () => {
    setIsBooking(true);
    setError(null);
    try {
      const result = await mockBookAppointment();
      if (result.success) {
        setBookingConfirmation(result.confirmationId);
      } else {
        setError("Failed to book the appointment. Please try again later.");
      }
    } catch (err) {
      setError("An error occurred while booking the appointment.");
    } finally {
      setIsBooking(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MedAssist AI</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Disclaimer />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 border-b pb-3 text-slate-700">Patient Information & Current Situation</h2>
            <UserInputForm
              userInput={userInput}
              setUserInput={setUserInput}
              onSubmit={handleInitialAssessment}
              isLoading={isLoading}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 min-h-[300px] flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-4 border-b pb-3 text-slate-700">AI Assessment & Recommendation</h2>
            {isLoading && <Loader />}
            {!isLoading && error && <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">{error}</div>}
            
            {!isLoading && !error && (
              <>
                {bookingConfirmation && (
                  <div className="text-center text-green-700 bg-green-50 p-4 rounded-md mb-4 animate-fade-in">
                    <h3 className="font-bold">Appointment Booked!</h3>
                    <p>Your Confirmation ID is: <strong>{bookingConfirmation}</strong></p>
                  </div>
                )}

                {aiDecision && (
                  <DecisionDisplay
                    decision={aiDecision}
                    onBookAppointment={handleBookAppointment}
                    isBooking={isBooking}
                    bookingConfirmed={!!bookingConfirmation}
                    onReassess={handleReassessment}
                    isReassessing={isLoading}
                  />
                )}
                
                {!aiDecision && !bookingConfirmation && (
                  <div className="text-center text-slate-500">
                    <p>The AI-generated assessment will appear here after you submit the patient's information.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} MedAssist AI. For demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
