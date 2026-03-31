/**
 * Loading spinner shown while data is being fetched.
 */
function LoadingSpinner() {
  return (
    <div className="spinner-wrap" role="status" aria-label="Жүктелуде">
      <div className="spinner" />
    </div>
  );
}

export default LoadingSpinner;
