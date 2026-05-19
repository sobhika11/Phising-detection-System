async function runUrlEnrichmentPipeline(url, riskData = {}) {
  return {
    enrichment: null,
    reputation: null,
    graphSaved: false
  };
}

module.exports = {
  runUrlEnrichmentPipeline
};