<% OPTION EXPLICIT %>
<!--#include file="globalvars.inc"-->

<%
if isEmpty(Session("lang")) then
	if Request.Cookies("language") = "" then
		Session("lang") = "cht"
	else
		Session("lang") = Request.Cookies("lang")
	end if
end if

if Session("lang") <> "cht" and Session("lang") <> "chs" and Session("lang") <> "" then
	Session("lang") = "cht"
end if


%>

<%
Function ConnectProchartDatabase(myConnect, myRecordSet)
	Dim myDriver
	myDriver = "DSN=Prochart;UID=admin;PWD=yp8jc369uc46"
	Set myConnect = Server.CreateObject("ADODB.Connection")
	Set myRecordSet = Server.CreateObject("ADODB.Recordset")
	myConnect.Open myDriver
End Function

Function FillZero(intNum,intLen)
	if intLen > 10 then
		intLen = 10
	end if
	FillZero = Right("0000000000"& intNum, intLen)
End Function


Function MapExch(Code, Exch)
	Exch = UCase(Exch)
	If Left(Code, 1) = "/" Then
		Exch = "IX"
	End if
	MapExch = Exch
End Function


Function MapCode(Code, Exch)
	Code = UCase(Trim(Code))
	Exch = UCase(Trim(Exch))
	If Exch = "IX" and Left(Code, 1) <> "/" Then
		Code = "/" + Code
	Elseif Exch = "HK" then
		if isempty(Code) or Code="" then
			Code = "0001"
		end if
		if IsNumeric(Code) then
			if CLNG(Code) <= 9999 then
				Code = FillZero(Code, 4)
			else
				Code = FillZero(Code, 5)
			end if
		end if
	Elseif Exch = "SZ" or Exch = "SH" then
		Code = FillZero(Code, 6)
	End If
	MapCode = Code
End Function


Function MapTable(Code, Exch, Interval)
	dim tablename
	Select Case Interval
		Case "1"
			tablename = "tblWeek"
		Case "2"
			tablename = "tblMonth"
		Case "3"
			tablename = "tblMin"
		Case "4"
			tablename = "tbl5Min"
		Case "5"
			tablename = "tbl10Min"
		Case "6"
			tablename = "tbl15Min"
		Case "7"
			tablename = "tbl30Min"
		Case "8"
			tablename = "tblHour"
		Case "9"
			tablename = "tbl2Hour"
		Case "10"
			tablename = "tbl4Hour"
		Case Else
			tablename = "tblDay"
	End Select

	if left(code, 1) = "/" then
		tablename	= tablename + "IX"
	else
		if exch = "US" then
			if left(code,1) >= "A" and left(code,1) <= "Z" then
				tablename = tablename + "US" + left(code,1)
			else
				tablename = tablename + "USX"
			end if
		else
			tablename = tablename + exch
		end if
	end if

	tablename = tablename + " "
	MapTable = tablename

End Function

Function UnEmpty()

	If NOT isArray(stockid) Then

		SetCookie("1*2*3*4*5*6*7*8*9*10")
		stockid = GetCookie()

	End If

End Function

Function GetCookie(exch)

	Dim orgValue
	orgValue = Request.Cookies(exch)

	If orgValue <> Empty Then
		GetCookie = Split(orgValue , "*")
	Else
		GetCookie = 0
	End If

End Function

Function SetCookie(stockid, exch)

	Dim orgValue
	orgValue = Request.Cookies(exch)

	If orgValue <> Empty Then

		Dim allcookies
		allcookies = Split(orgValue, "*")

		Dim curr_id
		For each curr_id in allcookies

			If curr_id = stockid Then

				Exit Function  ' cookie exist; return with error

			End If

		Next

		orgValue = orgValue & "*" & stockid

	Else

		orgValue = stockid

	End If

	Response.Cookies(exch) = orgValue
	Response.Cookies(exch).Expires = Date() + 30

	SetCookie = 1

End Function

Function DelCookie(stockid, exch)

	stockid = trim(stockid)

	Dim orgValue
	orgValue = Request.Cookies(exch)

	If orgValue <> Empty Then

		Dim allcookies, delNum
		allcookies = Split(orgValue, "*")
		delNum = -1

		For i = 0 to UBound(allcookies)
			If allcookies(i) = CStr(stockid) Then
				delNum = i
				Exit For
			End If
		Next

		If delNum <> -1 Then
			newcookie = ""

			For i = 0 to UBound(allcookies)
				If i <> delNum Then
					newcookie =  newcookie & "*" & allcookies(i)
				End If
			Next

			If newcookie <> Empty Then
				newcookie = Right(newcookie, len(newcookie) - 1)
			End If

			Response.Cookies(exch) = newcookie
			Response.Cookies(exch).Expires = Date() + 30

		End If

	End If

End Function


Function ConvertDate(strDate)
	Dim retDateStr
	Trim(strDate)
	retDateStr = Year(strDate) & FillZero(Month(strDate),2) & FillZero(Day(strDate),2) & FillZero(Hour(strDate),2) & FillZero(Minute(strDate),2)
	ConvertDate = retDateStr
End Function


Function getDateStr(date)

	Dim retStr

	if Len(date) = 8 then		' YYYYMMDD
		if Session("lang") = "cht" then
			retStr = left(date, 4) & "" & mid(date,5,2) & "る" & mid(date,7,2) & "ら"
		elseif Session("lang") = "chs" then
			retStr = left(date, 4) & "年" & mid(date,5,2) & "月" & mid(date,7,2) & "日"
		else
			retStr = MonthArray(CInt(mid(date,5,2))-1) & " " & mid(date,7,2) & ", " & left(date,4)
		end if
	else	' YYYY/MM/DD or YYYY-MM-DD
		if Session("lang") = "cht" then
			retStr = left(date, 4) & "" & mid(date,6,2) & "る" & mid(date,9,2) & "ら"
		elseif Session("lang") = "chs" then
			retStr = left(date, 4) & "年" & mid(date,6,2) & "月" & mid(date,9,2) & "日"
		else
			retStr = MonthArray(CInt(mid(date,6,2))-1) & " " & mid(date,9,2) & ", " & left(date,4)
		end if
	end if

	getDateStr = retStr

End Function


Function checkDate(strDate)

	Dim Status, yyyy, mm, dd
	
	On Error Resume Next
	Status = TRUE

	if len(strDate) <> 8 or not IsNumeric(strDate) then
		Status = FALSE
	else

		yyyy = CInt(Left(strDate, 4))
		mm = CInt(Mid(strDate, 5, 2))
		dd = CInt(Right(strDate, 2))
	
		'Response.write yyyy & "/" & mm & "/" & dd & "<br>"

		select case mm
			case 4, 6, 9, 11
				if dd < 1 or dd > 30 then
					Status = FALSE
				end if
			case 2
				if dd < 1 or dd > 29 then
					Status = FALSE
				end if
			case else
				if dd < 1 or dd > 31 then
					Status = FALSE
				end if
		end select
	end if

	checkDate = Status
End Function


Function chkDate(mm, dd)
	Dim Status
	Status = TRUE
	select case mm
		case "04", "06", "09", "11"
			if dd > "30" then
				Status = FALSE
			end if
		case "02"
			if dd > "29" then
				Status = FALSE
			end if
		case else
			if dd > "31" then
				Status = FALSE
			end if
	end select
	chkDate = Status
End Function

Function getDecimal(exch, num)
	Dim dec

	if exch = "CU" then
	  if num > 10000 then
		dec = 0
	  elseif num > 1000 then
		dec = 1
	  elseif num > 50 then
		dec = 2
	  elseif num > 10 then
		dec = 3
	  else
		dec = 4
	  end if
	else
	  if num > 1000 then
		dec = 0
	  elseif num > 100 then
		dec = 1
	  elseif num > 0.5 then
		dec = 2
	  else
		dec = 3
	  end if
	end if

	getDecimal = dec

End Function


'Format SQL Query funtion
Private Function formatSQLInput(strInputEntry)

	'Remove malisous charcters from links and images
	strInputEntry = Replace(strInputEntry, "<", "&lt;")
	strInputEntry = Replace(strInputEntry, ">", "&gt;")
	strInputEntry = Replace(strInputEntry, """", "", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "=", "&#061;", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "'", "''", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "select", "sel&#101;ct", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "join", "jo&#105;n", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "union", "un&#105;on", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "where", "wh&#101;re", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "insert", "ins&#101;rt", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "delete", "del&#101;te", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "update", "up&#100;ate", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "like", "lik&#101;", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "drop", "dro&#112;", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "create", "cr&#101;ate", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "modify", "mod&#105;fy", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "rename", "ren&#097;me", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "alter", "alt&#101;r", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "cast", "ca&#115;t", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "pass", "pa&#115;s", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "code", "co&#100;e", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "author", "aut&#104;or", 1, -1, 1)
	strInputEntry = Replace(strInputEntry, "username", "usernam&#101;", 1, -1, 1)
	
	'Return
	formatSQLInput = strInputEntry
End Function


%>