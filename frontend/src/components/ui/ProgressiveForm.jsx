import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, CheckIcon } from '@heroicons/react/24/solid';

const ProgressiveForm = ({ questions, onSubmit }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [inputValue, setInputValue] = useState('');

    const currentQuestion = questions[currentStep];
    const isLastStep = currentStep === questions.length - 1;

    const handleNext = () => {
        if (!inputValue && currentQuestion.required) return;

        setAnswers({ ...answers, [currentQuestion.id]: inputValue });
        setInputValue('');

        if (isLastStep) {
            onSubmit({ ...answers, [currentQuestion.id]: inputValue });
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleNext();
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <div className="mb-8">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <p className="text-right text-sm text-gray-500 mt-2">
                    Question {currentStep + 1} of {questions.length}
                </p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[300px] flex flex-col justify-center"
                >
                    <h2 className="text-3xl font-light text-gray-900 mb-2">
                        {currentQuestion.text}
                    </h2>
                    {currentQuestion.description && (
                        <p className="text-gray-500 mb-6">{currentQuestion.description}</p>
                    )}

                    <div className="mt-4">
                        {currentQuestion.type === 'text' && (
                            <input
                                autoFocus
                                type="text"
                                className="w-full border-b-2 border-gray-300 py-2 text-2xl focus:border-indigo-600 focus:outline-none bg-transparent"
                                placeholder="Type your answer here..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        )}

                        {currentQuestion.type === 'multiple_choice' && (
                            <div className="space-y-3">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setInputValue(option);
                                            // Auto advance for multiple choice? Maybe user wants to confirm using Enter.
                                            // Let's just set value.
                                        }}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                            inputValue === option
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg">{option}</span>
                                            {inputValue === option && (
                                                <CheckIcon className="h-6 w-6 text-indigo-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {currentQuestion.type === 'boolean' && (
                             <div className="flex gap-4">
                                {['Yes', 'No'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setInputValue(option)}
                                         className={`flex-1 p-4 rounded-lg border-2 transition-all text-center ${
                                            inputValue === option
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-lg font-medium">{option}</span>
                                    </button>
                                ))}
                             </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!inputValue && currentQuestion.required}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg text-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLastStep ? 'Submit' : 'OK'}
                    {!isLastStep && <ChevronRightIcon className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
};

export default ProgressiveForm;
