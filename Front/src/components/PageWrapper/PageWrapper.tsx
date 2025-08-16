interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      minHeight: "100%",
      backgroundColor: "rgb(23, 25, 27)"
    }}>
      <div style={{
        width: "1120px",
        marginTop: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {children}
      </div>
    </div>
  );
};
export default PageWrapper;