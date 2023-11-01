import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import axios from 'axios';
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

    constructor(
        private sanitizer: DomSanitizer,
        private route: ActivatedRoute
        ) {}
        
    documents: any = []
    htmlContent: SafeHtml | any;
    amendedText: any = []
    params: any = {
        t: '',
        s: '',
        c: ''
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.params.t = params['t'];
            this.params.s = params['s'];
            this.params.c = params['c'];
            this.getData()
        });
    }

    atob(encodedData: string): string {
        return atob(encodedData);
    }
    

    sanitise(htmlString: any) {
        return this.sanitizer.bypassSecurityTrustHtml(htmlString)
    }

    parseJSON(string: string){
        return JSON.parse(string)
    }

    formatDataArray(dataArray: any[][]): string {
        let result = '';
        let inYellow = false;
    
        for (const [type, text] of dataArray) {
            if (type === 'A') {
                result += inYellow ? '</span>' : '';
                result += text;
                inYellow = false;
            } else if (type === 'B') {
                if (!inYellow) {
                    result += '<span style="background-color: yellow;">';
                    inYellow = true;
                }
                result += text;
            }
        }
    
        if (inYellow) {
            result += '</span>';
        }
        return result;
      }

    prepareHTMLWithLineBreaks(htmlString: string): string {
        // Replace newline characters with <br> elements
        return htmlString.replace(/\n/g, '<br>');
    }

    truncateString(str: string) {
        if (str.length > 40) {
          return str.slice(0, 40 - 3) + '...';
        } else {
          return str;
        }
    }

    async getData() {
        const payload = {
            context: {
                CLASS: 'ENGAGE',
                METHOD: 'GETCNDETAILSFIELD',
            },

            data: { NOTENUMBER: this.params.c },
        };

        const header = {
            headers: {
                'Content-Type': 'application/json',
                token: 'BK175mqMN0'
            }
        }

        try {
            const res = await axios.post(
                `https://io.bidvestfm.co.za/BIDVESTFM_API_ZRFC3/request?sys=${this.params.s}`,
                payload,
                header
            );
            this.documents = res.data.RESULT.map((item: any)=> ({
                ...item,
                OBJECTVALUE: atob(item.OBJECTVALUE), 
                OBJECTTRACKER: atob(item.OBJECTTRACKER)
            }))
        } catch (error) {
            console.log(error);
        }
    }

    decision(obj: any, action: string) {

        const modified = JSON.parse(this.documents[0].OBJECTTRACKER).map((item: any)=> {
            if (JSON.stringify(item) === JSON.stringify(obj)) {
                if (action === 'accepted') {
                    return { ...obj, status: 'accepted' };
                } else if (action === 'rejected') {
                    return { ...obj, status: 'rejected' };
                }
            }else{
                return item
            }
        })
        this.documents[0].OBJECTTRACKER = JSON.stringify(modified)
    }   
    
    async saveToSAP() {

        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1 and pad with '0'
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');
        const payload = {
            "context": {
                "CLASS":"ENGAGE",
                "METHOD":"PUTCNDETAILDECISION",
                "TOKEN": this.params.t
            },
            "data" : {...this.documents[0], 
                NOTENUMBER: this.params.c,
                OBJECTTRACKER: btoa(this.documents[0].OBJECTTRACKER), 
                OBJECTVALUE:  btoa(this.documents[0].OBJECTVALUE), 
                DECISIONDATE: `${year}-${month}-${day}`,
                DECISIONTIME: `${hours}:${minutes}:${seconds}`
            }
        }
        const header = {
            headers: {
                'Content-type': 'application/json',
                token: 'BK175mqMN0'
            }
        }

        try {
            const res = await axios.post(`https://io.bidvestfm.co.za/BIDVESTFM_API_ZRFC3/request?sys=${this.params.s}`, payload, header)
            console.log(res.data)
        } catch (error) {
            console.log(error)
        }
    }


}
