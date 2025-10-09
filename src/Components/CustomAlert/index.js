  const CustomAlert = ({ message, onClose }) => {
          if (!message) return null;

          return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
              ></div>

              {/* Alert Box */}
              <div className="relative z-10 w-[350px] rounded-2xl bg-black border border-[#FF9913]/40 shadow-[0_0_25px_rgba(255,153,19,0.6)] p-6 flex flex-col items-center">
                <img src={"https://image2url.com/images/1755511837883-d480dc7d-7419-4341-acc6-decf0d6810b5.png"} alt="Logo" className="w-16 h-16 mb-3" />
                <p className="text-center text-white text-base font-medium mb-4">
                  {message}
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold hover:opacity-90 transition"
                >
                  OK
                </button>
              </div>
            </div>
          );
        };

export default CustomAlert