<!--#include file="..\inc\function.inc"-->
<%
Response.Expires=-1

Dim Code, Interval, ChartType, MaxBarNo, Exch, Mode, Table
Dim recordLimit, query, isUSStock, BeforeDate, TheDate, RealTime
DIM rs,conn

Code		= Request("Code")		' Code
Exch		= Request("Exch")		' Exch "CU","IX","HK","US","CA","SH","SZ","TW"
Interval	= Request("Interval")	' 0=Daily, 1=Weekly, 2=Monthly, 3=Min, 4=5Min, 5=10Min, 6=15Min, 7=30Min, 8=1Hour, 9=2Hour, 10=4Hour
MaxBarNo	= Request("MaxBarNo")	' Max. Bar Number
ChartType	= Request("ChartType")	' 0=ProSticks, 1=ProsticksV, 2=...
BeforeDate	= Request("Date")		' Get data before this date
TheDate		= Request("Date")		' Get data before this date / week / month
RealTime		= Request("RT")		' RealTime data ?

if not RealTime = "true" then
	RealTime = ""
end if

if BeforeDate = "" then
  BeforeDate = "20790606"
elseif Len(BeforeDate) = 12 then	' YYYYMMDDHHMM
  BeforeDate = Left(BeforeDate,4) & "-" & Mid(BeforeDate, 5, 2) & "-" & Mid(BeforeDate, 7, 2) & " " & Mid(BeforeDate, 9, 2) & ":" & Right(BeforeDate, 2)
end if

if TheDate = "" then
  TheDate = "GETDATE()"
else
  TheDate = "'" & TheDate & "'"
end if

isUSStock	= FALSE

if MaxBarNo = "" then
	MaxBarNo = 300
end if

if MaxBarNo > 0 then
	recordLimit = MaxBarNo
else
	recordLimit = 300
end if

if Interval = "" then
	interval = 0
end if


if ChartType = "" then
	ChartType = 0
end if

Exch  = MapExch(Code, Exch)
Code  = MapCode(Code, Exch)
Table = MapTable(Code, Exch, Interval)

Select Case Interval
	Case "0"		' Daily
		IF ChartType = 1 and Exch = "HK" THEN
				query = "SELECT TOP " & MaxBarNo & " hk.Code, hk.DateTime, hk.DayOpen, hk.DayHigh, hk.DayLow, hk.DayClose, hk.DayVolume, hk.DayChange, hk.DayPChange, " & _
					"hkv.VAPlusV, hkv.VAMinV, hkv.MPV, hkv.MCV, hk.UpperTail, hk.LowerTail from tblDayHK hk, tblDayHKV hkv WHERE " & _
					"hk.Code = hkv.Code AND DATEDIFF(day, hk.DateTime, hkv.DateTime) = 0 AND " & _
					"hk.Code = '" & Code & "' and hkv.DateTime < '" & BeforeDate & "' order by hk.DateTime DESC"
		ELSE
				query = "SELECT TOP " & MaxBarNo & " *, cast(DateDiFF(s, '1970-01-01 00:00:00.000', DateTime) as bigint)*1000 as DateTimeMS FROM " & Table & " WHERE Code = '" & Code & "' and DateTime < '" & BeforeDate & "' ORDER BY DateTime Desc"
		END IF
	Case "1"
		query = "SELECT TOP " & MaxBarNo & " * FROM " & Table & " WHERE Code = '" & Code & "' and Week < '" & BeforeDate & "' ORDER BY Week DESC"
	Case "2"
		query = "SELECT TOP " & MaxBarNo & " * FROM " & Table & " WHERE Code = '" & Code & "' and Month < '" & BeforeDate & "' ORDER BY Month DESC"
	Case Else	' Intraday
		query = "SELECT TOP " & MaxBarNo & " * FROM " & Table & " WHERE Code = '" & Code & "' and DateTime < '" & BeforeDate & "' ORDER BY DateTime DESC"
End Select

'Response.write query & "<br>"
'Response.flush

Dim resultString
Dim recordCount

	ConnectProchartDatabase conn, rs


	resultString = ""
	recordCount = 0

	rs.open query, conn
	Do while NOT rs.EOF and recordCount<recordLimit
		If Not (recordCount = 0) Then
			resultString = resultString & ","  & vbcrlf
		End If
		resultString = resultString & "{""dt"":" & ConvertDate(rs(1)) & ",""o"":" & rs(2) & ",""h"":" & rs(3) & ",""l"":" & rs(4) & ",""c"":" & rs(5) & ",""v"":" & rs(6)
		if (Interval = 0 or Interval = 1 or Interval = 2) and NOT isUSStock Then
			resultString = resultString  & ",""vap"":" & rs(9) & ",""vam"":" & rs(10) & ",""mp"":" & rs(11) & ",""mc"":" & rs(12)
		End if
		if (Interval = 0) and NOT isUSStock Then
			resultString = resultString & ",""ut"":" & rs(13) & ",""lt"":" & rs(14)
		End if
		resultString = resultString & "}"
		recordCount = recordCount + 1
		rs.MoveNext
	Loop
	rs.Close
	conn.close


If Len(resultString) = 0 Then
	resultString = "null"
End IF

Response.write "[" & resultString & "]"
Response.end

set rs=Nothing
set conn=Nothing
%>