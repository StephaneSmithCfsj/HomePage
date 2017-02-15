<#
.SYNOPSIS
Provisions the Negotium events calendar.
.EXAMPLE
PS C:\> .\Deploy-Calendar-Data.ps1 -TargetSiteUrl "https://intranet.mydomain.com/sites/targetSite"
.EXAMPLE
PS C:\> $creds = Get-Credential
PS C:\> .\Deploy-Calendar-Data.ps1 -TargetSiteUrl "https://intranet.mydomain.com/sites/targetSite" -Credentials $creds
#>
[CmdletBinding()]
param
(
    [Parameter(Mandatory = $true, HelpMessage="Enter the URL of the target site collection, e.g. 'https://intranet.mydomain.com/sites/targetSite'")]
    [String]$TargetSiteUrl,

    [Parameter(HelpMessage="Enter the name of the list, e.g. 'Calendar'")]
    [String]$targetList = "Calendar",
    
    [Parameter(Mandatory = $false, HelpMessage="Optional administration credentials")]
    [PSCredential]$Credentials
)

begin{
    if($Credentials -eq $null)
        {
            $Credentials = Get-Credential -Message "Enter Admin Credentials"
        }
    Connect-SPOnline $targetSiteUrl -Credentials $Credentials
    
}

process{
    $list = Get-SPOList $targetList    
    Get-SPOListItem -List $targetList | %{ Remove-SPOListItem -List $targetList -Identity $_.Id -Force}
    Write-Host -ForegroundColor Yellow "Removed All Events from the Calendar list"
}




