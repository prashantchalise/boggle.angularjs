 
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BogglePC.Model
{
    [Table("TBL_SystemInfo")]
    public class SystemInfo : AuditableEntity<long>
    {   

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int InfoId { get; set; }


        [MaxLength(200)]
        [Display(Name = "Info Name")]
        public string InfoName { get; set; }


        [MaxLength(200)]
        [Display(Name = "Info Value")]
        public string InfoValue { get; set; }


        [MaxLength(100)]
        [Display(Name = "Remarks")]
        public string Remarks { get; set; }


        [NotMapped]
        public Guid OrganizationId { get; set; }

    }

    /* SystemInfo View Model */
    public class SystemInfoViewModel
    {
        public Int64 RowNumber { get; set; }
        public int InfoId { get; set; }
        public string InfoName { get; set; }
        public string InfoValue { get; set; }
        public string Remarks { get; set; }

        public int TotalCount { get; set; }
    }

    /* SystemInfo View Model (Input) */
    public class SystemInfoViewModel_Input
    {
        public int? InfoId { get; set; }
        public string InfoName { get; set; }
        public int? PageNumber { get; set; }
        public int? PageSize { get; set; }
        public int? ShowAll { get; set; }
    }
}
