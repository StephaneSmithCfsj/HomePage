<#
.SYNOPSIS
Enables the Side Navigation on a target SharePoint 2013 or SharePoint 2016 on-premises site collection.
.EXAMPLE
PS C:\> .\Enable-SideNav.ps1 -TargetSiteUrl "https://intranet.mydomain.com/sites/targetSite"
.EXAMPLE
PS C:\> $creds = Get-Credential
PS C:\> .\Enable-SideNav.ps1 -TargetSiteUrl "https://intranet.mydomain.com/sites/targetSite" -InfrastructureSiteUrl "https://intranet.mydomain.com/sites/infrastructureSite" -Credentials $creds
#>



[CmdletBinding()]
param
(
    [Parameter(Mandatory = $true, HelpMessage="Enter the URL of the target site collection, e.g. 'https://intranet.mydomain.com/sites/targetSite'")]
    [String]
    $TargetSiteUrl,

    [Parameter(Mandatory = $false, HelpMessage="Optional administration credentials")]
    [PSCredential]
    $Credentials
)

if($Credentials -eq $null)
{
	$Credentials = Get-Credential -Message "Enter Admin Credentials"
}

Write-Host -ForegroundColor White "--------------------------------------------------------"
Write-Host -ForegroundColor White "|               Enabling Side Navigation                 |"
Write-Host -ForegroundColor White "--------------------------------------------------------"

Write-Host -ForegroundColor Yellow "Target Site URL: $targetSiteUrl"

try
{
    Connect-SPOnline $targetSiteUrl -Credentials $Credentials
    Apply-SPOProvisioningTemplate -Path .\packages\artifacts.package.xml
    Apply-SPOProvisioningTemplate -Path .\packages\files.package.xml 
    
    $scriptUrl = $targetSiteUrl+"/SiteAssets/Negotium/Boost/SideNavigation/startup.js"
    Apply-SPOProvisioningTemplate -Path .\packages\customaction.package.xml -Handlers CustomActions,Features -Parameters @{"ScriptUrl"=$scriptUrl;"SiteCollectionUrl"=$targetSiteUrl}
	
    Write-Host -ForegroundColor Green "Side Navigation application succeeded"
		
}
catch
{
    Write-Host -ForegroundColor Red "Exception occurred!" 
    Write-Host -ForegroundColor Red "Exception Type: $($_.Exception.GetType().FullName)"
    Write-Host -ForegroundColor Red "Exception Message: $($_.Exception.Message)"
}