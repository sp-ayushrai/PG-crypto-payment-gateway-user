import React, { useState, useEffect } from "react";
import {
  QrCode,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader,
  Wallet,
  Shield,
  ArrowLeft,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

const QRCodeGenerator = () => {
  const urlParams = new URLSearchParams(window.location.search);
  // get defaults from URL if present
  const defaultApiKey = urlParams.get("api_key") || "";
  const defaultApiSecret = urlParams.get("api_secret") || "";
  const defaultAmount = urlParams.get("amount") || "";

  // 🔑 added states for api key and secret
  const [apiKey, setApiKey] = useState(defaultApiKey);
  const [apiSecret, setApiSecret] = useState(defaultApiSecret);
  const [callbackUrl, setCallbackUrl] = useState(""); // new state for callback URL
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [currencyType, setCurrencyType] = useState("USDT-ERC20");
  const [amount, setAmount] = useState(defaultAmount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // View state management
  const [currentView, setCurrentView] = useState("payment"); // 'payment' or 'complaint'

  // Complaint form states
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintError, setComplaintError] = useState("");
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    amount: "",
    walletAddress: "",
    message: "",
    subject: "",
    currencyType: "USDT-ERC20", // default same as payment currency
  });

  const API_BASE_URL = "https://backend.payglobal.co.in/api/v1";
  // const API_BASE_URL = "http://localhost:5000/api/v1";

  const createTransaction = async () => {
    if (!amount || !apiKey || !apiSecret) {
      setError("Missing required parameters (amount, API key, or API secret)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ only add callbackUrl query if it's provided
      const callbackQuery = callbackUrl
        ? `&callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "";
      const url = `${API_BASE_URL}/transaction/create?amount=${amount}&currencyType=${currencyType}${callbackQuery}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": apiSecret,
          apiKey: apiKey,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to create transaction"
        );
      }

      if (data.success && data.url) {
        setPaymentUrl(data.url);
        setError("");
        window.location.href = data.url; // auto redirect
      } else {
        throw new Error(
          data.error || data.message || "Transaction creation failed"
        );
      }
    } catch (err) {
      console.error("Transaction creation error:", err);
      setError(err.message || "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async () => {
    if (!complaintForm.walletAddress) {
      setComplaintError("Wallet address is required");
      return;
    }

    if (!apiKey || !apiSecret) {
      setComplaintError("API Key and API Secret are required");
      return;
    }

    setComplaintLoading(true);
    setComplaintError("");
    setComplaintSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": apiSecret,
          apiKey: apiKey,
        },
        body: JSON.stringify({
          walletAddress: complaintForm.walletAddress,
          amount: complaintForm.amount,
          message: complaintForm.message,
          subject: complaintForm.subject,
          currencyType: complaintForm.currencyType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit complaint");
      }

      if (data.success) {
        setComplaintSuccess(true);
        setComplaintForm({
          amount: "",
          walletAddress: "",
          message: "",
          subject: "",
          currencyType: "USDT-ERC20",
        });
      } else {
        throw new Error(data.message || "Complaint submission failed");
      }
    } catch (err) {
      setComplaintError(err.message || "Failed to submit complaint");
      console.error("Complaint submission error:", err);
    } finally {
      setComplaintLoading(false);
    }
  };

  useEffect(() => {
    if (defaultAmount && defaultApiKey && defaultApiSecret) {
      setTimeout(() => {
        createTransaction();
      }, 100);
    }
  }, []);

  const resetTransaction = () => {
    setPaymentUrl(null);
    setError("");
    setAmount("");
  };

  const openPaymentUrl = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
    }
  };

  const handleComplaintFormChange = (field, value) => {
    setComplaintForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetComplaintForm = () => {
    setComplaintForm({
      amount: "",
      walletAddress: "",
      message: "",
      subject: "",
      currencyType: "USDT-ERC20",
    });
    setComplaintError("");
    setComplaintSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setCurrentView("payment")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                currentView === "payment"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <QrCode className="w-5 h-5 inline mr-2" />
              Generate Payment
            </button>
            <button
              onClick={() => setCurrentView("complaint")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                currentView === "complaint"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              File Complaint
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {currentView === "payment" ? (
            // Payment Generation View
            !paymentUrl ? (
              <>
                <div className="bg-blue-600 px-8 py-10 text-white">
                  <div className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <QrCode className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                      Generate Payment QR Code
                    </h2>
                    <p className="text-blue-100 text-lg">
                      Fast, secure, and easy cryptocurrency payments
                    </p>
                  </div>
                </div>

                <div className="px-8 py-8">
                  <div className="max-w-md mx-auto space-y-6">
                    {/* 🔑 Input for API Key */}
                     <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        API Key
                      </label>
                      <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API Key"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div> 

                    {/* 🔒 Input for API Secret */}
                     <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        API Secret
                      </label>
                      <input
                        type="text"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="Enter your API Secret"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Currency
                      </label>
                      <select
                        value={currencyType}
                        onChange={(e) => setCurrencyType(e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none text-gray-700 font-medium"
                      >
                        <option value="USDT-ERC20">USDT (ERC-20)</option>
                        <option value="USDT-TRC20">USDT (TRC-20)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Payment Amount
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl font-bold text-gray-900 text-center"
                      />
                    </div>
                    {/* 🌐 Input for Callback URL */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Callback URL
                      </label>
                      <input
                        type="text"
                        value={callbackUrl}
                        onChange={(e) => setCallbackUrl(e.target.value)}
                        placeholder="https://yourdomain.com/payment-callback"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        (If provided, backend will include this in the token)
                      </p>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="font-medium">{error}</span>
                      </div>
                    )}

                    <button
                      onClick={createTransaction}
                      disabled={loading || !amount || !apiKey || !apiSecret}
                      className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg"
                    >
                      {loading ? (
                        <Loader className="w-6 h-6 animate-spin mr-3" />
                      ) : (
                        <QrCode className="w-6 h-6 mr-3" />
                      )}
                      {loading ? "Generating Payment..." : "Generate QR Code"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Payment Success View
              <>
                <div className="bg-green-600 px-8 py-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Payment Link Ready</h2>
                      <p className="text-green-100">
                        Scan QR code or use the payment link
                      </p>
                    </div>
                    <button
                      onClick={resetTransaction}
                      className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Add your existing success UI here */}
              </>
            )
          ) : (
            // Complaint/Refund View
            <>
              <div className="bg-orange-600 px-8 py-10 text-white">
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">
                    Withdrawal Request(Test Purpo
                  </h2>
                  <p className="text-orange-100 text-lg">
                    Request refund for your transaction
                  </p>
                </div>
              </div>

              <div className="px-8 py-8">
                <div className="max-w-md mx-auto space-y-6">
                  {/* API Key */}
                   <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      API Key
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API Key"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div> 

                  {/* API Secret */}
                   <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      API Secret
                    </label>
                    <input
                      type="text"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Enter your API Secret"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Currency
                    </label>
                    <select
                      value={complaintForm.currencyType}
                      onChange={(e) =>
                        handleComplaintFormChange(
                          "currencyType",
                          e.target.value
                        )
                      }
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white appearance-none text-gray-700 font-medium"
                    >
                      <option value="USDT-ERC20">USDT (ERC-20)</option>
                      <option value="USDT-TRC20">USDT (TRC-20)</option>
                    </select>
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={complaintForm.amount}
                      onChange={(e) =>
                        handleComplaintFormChange("amount", e.target.value)
                      }
                      placeholder="Enter amount"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {/* Wallet Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Wallet Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={complaintForm.walletAddress}
                      onChange={(e) =>
                        handleComplaintFormChange(
                          "walletAddress",
                          e.target.value
                        )
                      }
                      placeholder="Enter your wallet address for refund"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={complaintForm.subject}
                      onChange={(e) =>
                        handleComplaintFormChange("subject", e.target.value)
                      }
                      placeholder="Refund Request (optional)"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Message
                    </label>
                    <textarea
                      value={complaintForm.message}
                      onChange={(e) =>
                        handleComplaintFormChange("message", e.target.value)
                      }
                      placeholder="Describe your issue or reason for refund request"
                      rows="4"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    />
                  </div>

                  {/* Success Message */}
                  {complaintSuccess && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="font-medium">
                        Complaint submitted successfully! Your refund request is
                        being processed.
                      </span>
                    </div>
                  )}

                  {/* Error Message */}
                  {complaintError && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center">
                      <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="font-medium">{complaintError}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={submitComplaint}
                      // disabled={complaintLoading  || !complaintForm.walletAddress || !apiKey || !apiSecret || !amount} //|| !complaintForm.transactionIdDeposite
                      className="flex-1 bg-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg"
                    >
                      {complaintLoading ? (
                        <Loader className="w-6 h-6 animate-spin mr-3" />
                      ) : (
                        <MessageSquare className="w-6 h-6 mr-3" />
                      )}
                      {complaintLoading ? "Submitting..." : "Submit Complaint"}
                    </button>

                    <button
                      onClick={resetComplaintForm}
                      className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
