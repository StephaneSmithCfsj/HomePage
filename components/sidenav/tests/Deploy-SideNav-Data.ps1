<#
.SYNOPSIS
Provisions the Negotium events Carousel.
.EXAMPLE
PS C:\> .\Deploy-Carousel-Data.ps1 -TargetSiteUrl "https://intranet.mydomain.com/sites/targetSite"
.EXAMPLE
PS C:\> $creds = Get-Credential
PS C:\> .\Deploy-Carousel-Data.ps1 -TargetSiteUrl "https://intranet.mydomain.com/sites/targetSite" -Credentials $creds
#>
[CmdletBinding()]
param
(
    [Parameter(Mandatory = $true, HelpMessage="Enter the URL of the target site collection, e.g. 'https://intranet.mydomain.com/sites/targetSite'")]
    [String]$TargetSiteUrl,

    [Parameter(HelpMessage="Enter the name of the list, e.g. 'Pages'")]
    [String]$targetList = "Side Navigation Links",
    
    [Parameter(Mandatory = $false, HelpMessage="Optional administration credentials")]
    [PSCredential]$Credentials

)

begin{ 

    function Convert-PSCustomObject-ToHashtable{
          param(
            [parameter(Mandatory=$True,ValueFromPipeline=$True)]$psObject
            )
        
            process {
                $hashTable = @{}
                Get-Member -InputObject $psObject -MemberType NoteProperty | 
                        ?{ -not [string]::IsNullOrEmpty($psObject."$($_.name)")} | 
                                    % {$hashTable.add($_.name,$psObject."$($_.name)")}
                return $hashTable
            }     
    }
}

process{
    <# 
    if($Credentials -eq $null)
    {
        $Credentials = Get-Credential -Message "Enter Admin Credentials"
    } 
    #>

    Write-Host -ForegroundColor White "--------------------------------------------------------"
    Write-Host -ForegroundColor White "|       Deploying Negotium SideNav Sample data          |"
    Write-Host -ForegroundColor White "--------------------------------------------------------"

    Write-Host -ForegroundColor Yellow "Target Site URL: $targetSiteUrl"

    try
    {
        Connect-SPOnline $targetSiteUrl -Credentials $Credentials
        $list = Get-SPOList $targetList

        $navItems = Import-CSV -Path ".\sidenav-data.csv"  -Delimiter ';' 

        foreach ($item in $navItems)  
            { 
                Add-SPOListItem -List $targetList -Values (Convert-PSCustomObject-ToHashtable $item)                   
            }

        Write-Host -ForegroundColor Green "Negotium Events Carousel Sample data deployment succeeded"
    }
    catch
    {
        Write-Host -ForegroundColor Red "Exception occurred!" 
        Write-Host -ForegroundColor Red "Exception Type: $($_.Exception.GetType().FullName)"
        Write-Host -ForegroundColor Red "Exception Message: $($_.Exception.Message)"
    }
}


