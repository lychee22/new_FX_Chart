<%
Dim imagePath, absolutePath

imagePath = ""
absolutePath = ""

if Session("lang") <> "" then
	imagePath = Session("lang") & "/"
end if

Dim subsectiontitle, MonthArray
MonthArray = Array(	"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

%>