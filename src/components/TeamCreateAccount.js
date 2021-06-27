import React from 'react'
import { useHistory, Link, useLocation} from 'react-router-dom'

function TeamCreateAccount() {
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    return (
        <div>
            {parsed.barangayid ? 'proceed' : "false"}
        </div>
    )
}

export default TeamCreateAccount
