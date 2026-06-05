export const BuildStamp = () => {
  const commit = __APP_COMMIT__;

  if (!commit || commit === "unknown") {
    return null;
  }

  return (
    <div className="build-stamp" title={`Commit ${commit} built ${__APP_BUILD_TIME__}`} aria-label={`Build commit ${commit}`}>
      build {commit}
    </div>
  );
};
