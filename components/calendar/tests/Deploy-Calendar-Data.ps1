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
    [PSCredential]$Credentials,

    [Parameter(Mandatory = $false)]
    [DateTime]$ScheduleStartDate = (Get-Date),

    [Parameter(Mandatory = $false)]
    [DateTime]$ScheduleEndDate = (Get-Date).AddDays(15),

    [Parameter(Mandatory = $false)]
    [String]$ScheduleStartTime = "09:30",

    [Parameter(Mandatory = $false)]
    [String]$ScheduleEndTime = "16:30"
)

begin{
    function Schedule-Event{
        [Cmdletbinding()]
        param(
            [parameter(Mandatory=$True,ValueFromPipeline=$True)]$event,
            [parameter(Mandatory=$True)][DateTime]$StartDate,
            [parameter(Mandatory=$True)][DateTime]$EndDate,
            [parameter(Mandatory=$True)][string]$StartTime,
            [parameter(Mandatory=$True)][string]$EndTime
            )
        
        process {
            $eventDate = Get-RandomDateBetween -StartDate $StartDate -EndDate $EndDate | Get-Date
            $eventTime =  Get-RandomTimeBetween -StartTime $StartTime -EndTime $EndTime
            $eventDateTime = $eventDate.Add($eventTime)
            $eventEndDate = $eventDateTime.AddHours((Get-Random 1,2,3))
            Add-Member -InputObject $event -MemberType NoteProperty -Name "EventDate" -Value $eventDateTime.ToUniversalTime()         
            Add-Member -InputObject $event -MemberType NoteProperty -Name "EndDate" -Value $eventEndDate
            Write-Host "Scheduled event `"$($event.Title)`" at $eventDateTime" -ForegroundColor Yellow
            return $event

        }

    }

    function Get-RandomDateBetween{
        <#
        .EXAMPLE
        Get-RandomDateBetween -StartDate (Get-Date) -EndDate (Get-Date).AddDays(15)
        #>
        [Cmdletbinding()]
        param(
            [parameter(Mandatory=$True)][DateTime]$StartDate,
            [parameter(Mandatory=$True)][DateTime]$EndDate
            )

        process{
           return Get-Random -Minimum $StartDate.Ticks -Maximum $EndDate.Ticks | Get-Date -Format d
        }
    }

    function Get-RandomTimeBetween{
        <#
        .EXAMPLE
        Get-RandomTimeBetween -StartTime "08:30" -EndTime "16:30"
        #>
        [Cmdletbinding()]
        param(
            [parameter(Mandatory=$True)][string]$StartTime,
            [parameter(Mandatory=$True)][string]$EndTime
            )
        begin{
            $minuteTimeArray = @("00","15","30","45")
        }    
        process{
            $rangeHours = @($StartTime.Split(":")[0],$EndTime.Split(":")[0])
            $hourTime = Get-Random -Minimum $rangeHours[0] -Maximum $rangeHours[1]
            $minuteTime = "00"
            if($hourTime -ne $rangeHours[0] -and $hourTime -ne $rangeHours[1]){
                $minuteTime = Get-Random $minuteTimeArray
                return "${hourTime}:${minuteTime}"
            }
            elseif ($hourTime -eq $rangeHours[0]) { # hour is the same as the start time so we ensure the minute time is higher
                $minuteTime = $minuteTimeArray | ?{ [int]$_ -ge [int]$StartTime.Split(":")[1] } | Get-Random # Pick the next quarter
                #If there is no quarter available (eg 09:50) we jump to the next hour (10:00)
                return (.{If(-not $minuteTime){ "${[int]hourTime+1}:00" }else{ "${hourTime}:${minuteTime}" }})               
             
            }else { # hour is the same as the end time
                #By sorting the array, 00 will be pick if no close hour quarter is found
                $minuteTime = $minuteTimeArray | Sort-Object -Descending | ?{ [int]$_ -le [int]$EndTime.Split(":")[1] } | Get-Random
                return "${hourTime}:${minuteTime}"
            }
        }
    }

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
Write-Host -ForegroundColor White "|   Deploying Negotium Events Calendar Sample data      |"
Write-Host -ForegroundColor White "--------------------------------------------------------"

Write-Host -ForegroundColor Yellow "Target Site URL: $targetSiteUrl"

try
{
    Connect-SPOnline $targetSiteUrl -Credentials $Credentials
    $list = Get-SPOList $targetList

    $events = Get-Content -Encoding UTF8  .\events-data.json  -Raw| ConvertFrom-Json
    $events | Schedule-Event -startdate $ScheduleStartDate -enddate $ScheduleEndDate -starttime $ScheduleStartTime -endtime $ScheduleEndTime |
                     Convert-PSCustomObject-ToHashtable | 
                         %{ Add-SPOListItem -List $list -Values $_ }
    Write-Host -ForegroundColor Green "Negotium Events Calendar Sample data deployment succeeded"
}
catch
{
    Write-Host -ForegroundColor Red "Exception occurred!" 
    Write-Host -ForegroundColor Red "Exception Type: $($_.Exception.GetType().FullName)"
    Write-Host -ForegroundColor Red "Exception Message: $($_.Exception.Message)"
}
}


