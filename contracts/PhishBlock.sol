// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PhishBlock
 * @dev Decentralized phishing report registry with community voting
 */
contract PhishBlock {
    
    struct Report {
        uint256 id;
        string urlHash;  // Hash of URL for privacy
        address reporter;
        uint256 upvotes;
        uint256 downvotes;
        bool confirmedScam;
        uint256 timestamp;
        mapping(address => bool) voters;
    }
    
    uint256 public reportCount;
    mapping(uint256 => Report) public reports;
    mapping(string => uint256) public urlToReportId;
    
    uint256 public constant CONFIRMATION_THRESHOLD = 3;
    
    event ReportSubmitted(
        uint256 indexed id,
        string urlHash,
        address indexed reporter,
        uint256 timestamp
    );
    
    event VoteCasted(
        uint256 indexed reportId,
        address indexed voter,
        bool isScam
    );
    
    event ReportConfirmed(
        uint256 indexed reportId,
        string urlHash
    );
    
    /**
     * @dev Submit a new phishing report
     * @param _urlHash Hash of the URL being reported
     */
    function submitReport(string memory _urlHash) public {
        require(bytes(_urlHash).length > 0, "URL hash cannot be empty");
        require(urlToReportId[_urlHash] == 0, "URL already reported");
        
        reportCount++;
        
        Report storage newReport = reports[reportCount];
        newReport.id = reportCount;
        newReport.urlHash = _urlHash;
        newReport.reporter = msg.sender;
        newReport.upvotes = 0;
        newReport.downvotes = 0;
        newReport.confirmedScam = false;
        newReport.timestamp = block.timestamp;
        
        urlToReportId[_urlHash] = reportCount;
        
        emit ReportSubmitted(reportCount, _urlHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Vote on a report
     * @param _reportId ID of the report to vote on
     * @param _isScam true for upvote (scam), false for downvote (safe)
     */
    function vote(uint256 _reportId, bool _isScam) public {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        
        Report storage report = reports[_reportId];
        require(!report.voters[msg.sender], "Already voted on this report");
        require(!report.confirmedScam, "Report already confirmed");
        
        report.voters[msg.sender] = true;
        
        if (_isScam) {
            report.upvotes++;
        } else {
            report.downvotes++;
        }
        
        // Check if report should be confirmed
        if (report.upvotes >= CONFIRMATION_THRESHOLD && 
            report.upvotes > report.downvotes) {
            report.confirmedScam = true;
            emit ReportConfirmed(_reportId, report.urlHash);
        }
        
        emit VoteCasted(_reportId, msg.sender, _isScam);
    }
    
    /**
     * @dev Get report details
     * @param _reportId ID of the report
     */
    function getReport(uint256 _reportId) public view returns (
        uint256 id,
        string memory urlHash,
        address reporter,
        uint256 upvotes,
        uint256 downvotes,
        bool confirmedScam,
        uint256 timestamp
    ) {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        
        Report storage report = reports[_reportId];
        return (
            report.id,
            report.urlHash,
            report.reporter,
            report.upvotes,
            report.downvotes,
            report.confirmedScam,
            report.timestamp
        );
    }
    
    /**
     * @dev Check if address has voted on a report
     * @param _reportId Report ID
     * @param _voter Voter address
     */
    function hasVoted(uint256 _reportId, address _voter) public view returns (bool) {
        require(_reportId > 0 && _reportId <= reportCount, "Invalid report ID");
        return reports[_reportId].voters[_voter];
    }
    
    /**
     * @dev Check if URL has been reported
     * @param _urlHash Hash of the URL
     */
    function isReported(string memory _urlHash) public view returns (bool, uint256) {
        uint256 reportId = urlToReportId[_urlHash];
        return (reportId > 0, reportId);
    }
}