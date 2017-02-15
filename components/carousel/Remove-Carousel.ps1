<#
.SYNOPSIS
Disables the Side Navigation for a target SharePoint 2013 or SharePoint 2016 on-premises site collection.
.EXAMPLE
PS C:\> .\Disable-SideNav.ps1 -TargetSiteUrl "https://intranet.mydomain.com/sites/targetSite"
.EXAMPLE
PS C:\> $creds = Get-Credential
PS C:\> .\Disable-SideNav.ps1 -TargetSiteUrl "https://intranet.mydomain.com/sites/targetSite" -Credentials $creds
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
Write-Host -ForegroundColor White "|              Disabling Caroussel News                |"
Write-Host -ForegroundColor White "--------------------------------------------------------"

Write-Host -ForegroundColor Yellow "Target Site URL: $TargetSiteUrl"

try
{
    Connect-SPOnline $TargetSiteUrl -Credentials $Credentials
	
    $files = Find-SPOFile -Match *.webpart
	$composantToErase = ""
	foreach($file in $files){
		if ($file.Name -like "*carousel*")
		{
			$composantToErase = $file.ServerRelativeUrl
		}
	}  

	write-host "removing file : " $composantToErase
	Remove-SPOFile -ServerRelativeUrl $composantToErase -Force

    Write-Host -ForegroundColor Green "Caroussel News removal succeded"
}
catch
{
    Write-Host -ForegroundColor Red "Exception occurred!" 
    Write-Host -ForegroundColor Red "Exception Type: $($_.Exception.GetType().FullName)"
    Write-Host -ForegroundColor Red "Exception Message: $($_.Exception.Message)"
}