const ErrorSec = ({ gpData }) => {
    return (
        <div className="px-4 pb-4 error-message-container">
            <p className="text-center text-sm-start">
                An error has occurred. Couldn&apos;t retrieve {gpData}. Please try again by
                refreshing the page.
            </p>
        </div>
    );
};

export default ErrorSec;
